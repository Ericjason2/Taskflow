const { Op } = require("sequelize");
const {
  Task,
  User,
  Comment,
  Activity,
  Project,
  ProjectMember,
} = require("../models/associations");
const { sendNotification } = require("./notificationController");

const logActivity = async (
  type,
  description,
  userId,
  projetId = null,
  tacheId = null,
) => {
  try {
    await Activity.create({
      type,
      description,
      user_id: userId,
      projet_id: projetId,
      tache_id: tacheId,
    });
  } catch (_) {}
};

const applyBoardAutomations = async ({
  task,
  project,
  changes = {},
  oldValues = {},
  user,
  io,
}) => {
  const automations = Array.isArray(project.automations)
    ? project.automations
    : typeof project.automations === "string"
    ? (() => {
        try {
          const p = JSON.parse(project.automations);
          return Array.isArray(p) ? p : [];
        } catch {
          return [];
        }
      })()
    : [];

  if (automations.length === 0) return task;

  const hasRule = (ruleId) =>
    automations.includes(ruleId) ||
    automations.includes(`rule_${ruleId}`) ||
    automations.includes(ruleId.replace("rule_", ""));

  let needsSave = false;

  // 1. rule_auto_done (Clôture automatique bidirectionnelle)
  if (hasRule("rule_auto_done") || hasRule("auto_done_checklists")) {
    // Si la tâche passe au statut 'done' -> marquer toutes ses sous-tâches comme terminées
    if (changes.statut === "done" && Array.isArray(task.checklists) && task.checklists.length > 0) {
      const allDone = task.checklists.every((c) => c.termine && c.done);
      if (!allDone) {
        task.checklists = task.checklists.map((c) => ({
          ...c,
          termine: true,
          done: true,
        }));
        task.changed("checklists", true);
        needsSave = true;
      }
    }

    // Si toutes les sous-tâches sont cochées -> passer automatiquement la tâche à 'done'
    const currentChecklists = changes.checklists || task.checklists;
    if (Array.isArray(currentChecklists) && currentChecklists.length > 0) {
      const allChecked = currentChecklists.every((c) => c.termine || c.done);
      if (allChecked && task.statut !== "done") {
        task.statut = "done";
        task.changed("statut", true);
        needsSave = true;
      }
    }
  }

  // 2. rule_critical_alert (Alerte priorité critique)
  if (hasRule("rule_critical_alert") || hasRule("auto_critical_alert")) {
    if (changes.priorite === "critique" && oldValues?.priorite !== "critique") {
      const members = await ProjectMember.findAll({ where: { projet_id: project.id } });
      const recipientIds = new Set([project.createur_id, ...members.map((m) => m.user_id)]);
      recipientIds.delete(user.id);

      for (const recipientId of recipientIds) {
        await sendNotification({
          userId: recipientId,
          expediteurId: user.id,
          projetId: project.id,
          tacheId: task.id,
          type: "critical_alert",
          titre: "Alerte Priorité Critique",
          message: `La tâche "${task.titre}" a été passée en priorité critique par ${user.nom}`,
          io,
        });
      }
    }
  }

  // 3. rule_auto_start_on_assign (Prise en charge automatique)
  if (hasRule("rule_auto_start_on_assign") || hasRule("auto_assign_start")) {
    const hasAssigneeChange =
      changes.assigne_a ||
      (Array.isArray(changes.assignes) && changes.assignes.length > 0);
    if (hasAssigneeChange && task.statut === "todo") {
      task.statut = "in_progress";
      task.changed("statut", true);
      needsSave = true;
    }
  }

  // 4. rule_move_to_review (Contrôle qualité)
  if (hasRule("rule_move_to_review") || hasRule("auto_checklist_review")) {
    const currentChecklists = changes.checklists || task.checklists;
    if (Array.isArray(currentChecklists) && currentChecklists.length > 0) {
      const allChecked = currentChecklists.every((c) => c.termine || c.done);
      if (allChecked && task.statut === "in_progress") {
        task.statut = "review";
        task.changed("statut", true);
        needsSave = true;
      }
    }
  }

  if (needsSave) {
    await task.save();
  }

  return task;
};

// Helper: Normalize assignees input from body (supports assignes: [id, ...] or assigne_a: id)
const parseAssignees = (body) => {
  let targetAssignees = [];
  if (Array.isArray(body.assignes)) {
    targetAssignees = body.assignes
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id) && id > 0);
  } else if (body.assigne_a !== undefined) {
    const parsed = body.assigne_a ? parseInt(body.assigne_a, 10) : null;
    if (parsed && !isNaN(parsed) && parsed > 0) {
      targetAssignees = [parsed];
    }
  }
  return [...new Set(targetAssignees)];
};

// Helper: Populate assignes_details with User records on task(s)
const populateAssigneesDetails = async (tasks) => {
  if (!tasks) return tasks;
  const isArray = Array.isArray(tasks);
  const taskList = isArray ? tasks : [tasks];
  if (taskList.length === 0) return tasks;

  const allUserIds = new Set();
  for (const t of taskList) {
    if (Array.isArray(t.assignes)) {
      t.assignes.forEach((id) => allUserIds.add(id));
    }
    if (t.assigne_a) {
      allUserIds.add(t.assigne_a);
    }
  }

  if (allUserIds.size === 0) {
    for (const t of taskList) {
      t.dataValues.assignes_details = [];
    }
    return tasks;
  }

  const users = await User.findAll({
    where: { id: { [Op.in]: Array.from(allUserIds) } },
    attributes: ["id", "nom", "email", "avatar"],
  });

  const userMap = new Map(users.map((u) => [u.id, u.toJSON()]));

  for (const t of taskList) {
    const ids =
      Array.isArray(t.assignes) && t.assignes.length > 0
        ? t.assignes
        : t.assigne_a
        ? [t.assigne_a]
        : [];
    t.dataValues.assignes_details = ids.map((id) => userMap.get(id)).filter(Boolean);
  }

  return tasks;
};

exports.getTasks = async (req, res) => {
  try {
    const { projet_id } = req.params;
    const {
      statut,
      assigne_a,
      priorite,
      search,
      sort = "ordre",
      order = "ASC",
    } = req.query;
    const where = { projet_id };
    if (statut) where.statut = statut;
    if (assigne_a) {
      const aId = parseInt(assigne_a, 10);
      where[Op.or] = [
        { assigne_a: aId },
        { assignes: { [Op.like]: `%${aId}%` } },
      ];
    }
    if (priorite) where.priorite = priorite;
    if (search)
      where[Op.or] = [
        { titre: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: "assigne",
          attributes: ["id", "nom", "email", "avatar"],
        },
        { model: User, as: "createur", attributes: ["id", "nom", "avatar"] },
      ],
      order: [[sort, order]],
    });
    await populateAssigneesDetails(tasks);
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { projet_id } = req.params;
    const {
      titre,
      description,
      statut,
      priorite,
      echeance,
      tags,
      checklists,
      couverture,
      pieces_jointes,
    } = req.body;

    if (!titre || !titre.trim()) {
      return res.status(400).json({ success: false, message: "Le titre de la tâche est requis" });
    }

    // Verify project exists
    const project = await Project.findByPk(projet_id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });

    // Verify user is project creator, member or admin
    const isMember = await ProjectMember.findOne({
      where: { projet_id, user_id: req.user.id },
    });
    const canCreate =
      project.createur_id === req.user.id || isMember || req.user.role === "admin";

    if (!canCreate) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : vous devez être membre du tableau pour ajouter une tâche",
      });
    }

    // Validation assignation multi-collaborateurs : collaborateurs ajoutés excepté soi-même
    const hasAssigneesInput =
      req.body.assignes !== undefined || req.body.assigne_a !== undefined;
    const targetAssignees = hasAssigneesInput ? parseAssignees(req.body) : [];

    if (targetAssignees.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "L'assignation doit être attribuée à un collaborateur ajouté, pas à vous-même",
      });
    }

    for (const targetAssignee of targetAssignees) {
      const memberExists = await ProjectMember.findOne({
        where: { projet_id, user_id: targetAssignee },
      });
      if (!memberExists && targetAssignee !== project.createur_id) {
        return res.status(400).json({
          success: false,
          message: "Le collaborateur assigné doit être un membre ajouté au projet",
        });
      }
    }

    const task = await Task.create({
      titre: titre.trim(),
      description: description ? description.trim() : null,
      statut: ["todo", "in_progress", "review", "done"].includes(statut) ? statut : "todo",
      priorite: ["basse", "moyenne", "haute", "critique"].includes(priorite) ? priorite : "moyenne",
      assigne_a: targetAssignees.length > 0 ? targetAssignees[0] : null,
      assignes: targetAssignees,
      echeance: echeance || null,
      tags: Array.isArray(tags) ? tags : [],
      checklists: Array.isArray(checklists) ? checklists : [],
      couverture: couverture || null,
      pieces_jointes: Array.isArray(pieces_jointes) ? pieces_jointes : [],
      custom_fields: typeof req.body.custom_fields === "object" && req.body.custom_fields !== null ? req.body.custom_fields : {},
      projet_id,
      cree_par: req.user.id,
    });
    const full = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: "assigne",
          attributes: ["id", "nom", "email", "avatar"],
        },
        { model: User, as: "createur", attributes: ["id", "nom", "avatar"] },
      ],
    });
    await logActivity(
      "task_created",
      `Tâche "${titre}" créée dans "${project.titre}"`,
      req.user.id,
      projet_id,
      task.id,
    );

    // Notify all assigned collaborators
    for (const targetAssignee of targetAssignees) {
      await sendNotification({
        userId: targetAssignee,
        expediteurId: req.user.id,
        projetId: projet_id,
        tacheId: task.id,
        type: "task_assigned",
        titre: "Tâche assignée",
        message: `${req.user.nom} vous a assigné la carte "${task.titre}" dans "${project.titre}"`,
        io: req.io,
      });
    }

    await populateAssigneesDetails(full);
    res.status(201).json({ success: true, message: "Tâche créée", data: full });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId, {
      include: [
        {
          model: User,
          as: "assigne",
          attributes: ["id", "nom", "email", "avatar"],
        },
        { model: User, as: "createur", attributes: ["id", "nom", "avatar"] },
        {
          model: Comment,
          as: "commentaires",
          include: [
            { model: User, as: "auteur", attributes: ["id", "nom", "avatar"] },
          ],
          order: [["createdAt", "ASC"]],
        },
      ],
    });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Tâche introuvable" });
    await populateAssigneesDetails(task);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { projet_id } = req.params;
    const task = await Task.findByPk(req.params.taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Tâche introuvable" });

    const project = await Project.findByPk(projet_id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });

    // Verify user can modify: creator, project member, task creator, task assignee, or admin
    const isMember = await ProjectMember.findOne({
      where: { projet_id, user_id: req.user.id },
    });
    const isAssignee =
      task.assigne_a === req.user.id ||
      (Array.isArray(task.assignes) && task.assignes.includes(req.user.id));
    const canModify =
      project.createur_id === req.user.id ||
      isMember ||
      task.cree_par === req.user.id ||
      isAssignee ||
      req.user.role === "admin";

    if (!canModify) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : vous n'avez pas l'autorisation de modifier cette tâche",
      });
    }

    // Validation assignation multi-collaborateurs if updated
    const hasAssigneesInput =
      req.body.assignes !== undefined || req.body.assigne_a !== undefined;
    let targetAssignees = null;
    if (hasAssigneesInput) {
      targetAssignees = parseAssignees(req.body);
      if (targetAssignees.includes(req.user.id)) {
        return res.status(400).json({
          success: false,
          message: "L'assignation doit être attribuée à un collaborateur ajouté, pas à vous-même",
        });
      }
      for (const targetAssignee of targetAssignees) {
        const memberExists = await ProjectMember.findOne({
          where: { projet_id, user_id: targetAssignee },
        });
        if (!memberExists && targetAssignee !== project.createur_id) {
          return res.status(400).json({
            success: false,
            message: "Le collaborateur assigné doit être un membre ajouté au projet",
          });
        }
      }
      req.body.assignes = targetAssignees;
      req.body.assigne_a = targetAssignees.length > 0 ? targetAssignees[0] : null;
    }

    const oldStatut = task.statut;
    const oldAssignee = task.assigne_a;
    const oldAssignees =
      Array.isArray(task.assignes) && task.assignes.length > 0
        ? task.assignes
        : task.assigne_a
        ? [task.assigne_a]
        : [];
    const oldPriorite = task.priorite;
    await task.update(req.body);

    // Apply board automations
    await applyBoardAutomations({
      task,
      project,
      changes: req.body,
      oldValues: {
        statut: oldStatut,
        priorite: oldPriorite,
        assigne_a: oldAssignee,
      },
      user: req.user,
      io: req.io,
    });

    // Notify newly assigned collaborator(s)
    if (targetAssignees !== null) {
      const newlyAssigned = targetAssignees.filter(
        (id) => !oldAssignees.includes(id) && id !== req.user.id,
      );
      for (const newlyId of newlyAssigned) {
        await sendNotification({
          userId: newlyId,
          expediteurId: req.user.id,
          projetId: task.projet_id,
          tacheId: task.id,
          type: "task_assigned",
          titre: "Tâche assignée",
          message: `${req.user.nom} vous a assigné la carte "${task.titre}"`,
          io: req.io,
        });
      }
    }

    if (req.body.statut && req.body.statut !== oldStatut) {
      const labels = {
        todo: "À faire",
        in_progress: "En cours",
        review: "En révision",
        done: "Terminé",
      };
      await logActivity(
        "task_status_changed",
        `Tâche "${task.titre}" → ${labels[req.body.statut] || req.body.statut}`,
        req.user.id,
        task.projet_id,
        task.id,
      );
    }
    const full = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: "assigne",
          attributes: ["id", "nom", "email", "avatar"],
        },
        { model: User, as: "createur", attributes: ["id", "nom", "avatar"] },
      ],
    });
    await populateAssigneesDetails(full);
    res.json({ success: true, message: "Tâche mise à jour", data: full });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { projet_id } = req.params;
    const task = await Task.findByPk(req.params.taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Tâche introuvable" });

    const project = await Project.findByPk(projet_id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });

    const canDelete =
      project.createur_id === req.user.id ||
      task.cree_par === req.user.id ||
      req.user.role === "admin";

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Seul le créateur du projet ou l'auteur de la tâche peut la supprimer",
      });
    }

    await Comment.destroy({ where: { tache_id: task.id } });
    await task.destroy();
    res.json({ success: true, message: "Tâche supprimée" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Tâche introuvable" });

    const project = await Project.findByPk(task.projet_id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });

    const isMember = await ProjectMember.findOne({
      where: { projet_id: task.projet_id, user_id: req.user.id },
    });
    const isAssignee =
      task.assigne_a === req.user.id ||
      (Array.isArray(task.assignes) && task.assignes.includes(req.user.id));
    const canMove =
      project.createur_id === req.user.id ||
      isMember ||
      task.cree_par === req.user.id ||
      isAssignee ||
      req.user.role === "admin";

    if (!canMove) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const validStatuses = ["todo", "in_progress", "review", "done"];
    if (!validStatuses.includes(req.body.statut)) {
      return res.status(400).json({ success: false, message: "Statut invalide" });
    }

    const oldStatut = task.statut;
    await task.update({ statut: req.body.statut });

    // Apply board automations on status change
    await applyBoardAutomations({
      task,
      project,
      changes: { statut: req.body.statut },
      oldValues: { statut: oldStatut },
      user: req.user,
      io: req.io,
    });

    await populateAssigneesDetails(task);
    res.json({ success: true, message: "Statut mis à jour", data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Comments
exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByPk(taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Tâche introuvable" });

    // Auto-review automation check on hashtag #review
    if (req.body.contenu && req.body.contenu.includes("#review")) {
      const project = await Project.findByPk(task.projet_id);
      const automations = Array.isArray(project?.automations) ? project.automations : [];
      if (
        automations.includes("rule_move_to_review") ||
        automations.includes("auto_checklist_review")
      ) {
        await task.update({ statut: "review" });
      }
    }

    const comment = await Comment.create({
      contenu: req.body.contenu,
      tache_id: taskId,
      auteur_id: req.user.id,
    });
    const full = await Comment.findByPk(comment.id, {
      include: [
        { model: User, as: "auteur", attributes: ["id", "nom", "avatar"] },
      ],
    });

    // Notify task assignee(s) and creator
    if (task) {
      const recipients = new Set();
      if (Array.isArray(task.assignes) && task.assignes.length > 0) {
        task.assignes.forEach((uid) => {
          if (uid !== req.user.id) recipients.add(uid);
        });
      } else if (task.assigne_a && task.assigne_a !== req.user.id) {
        recipients.add(task.assigne_a);
      }
      if (task.cree_par && task.cree_par !== req.user.id) recipients.add(task.cree_par);
      for (const recId of recipients) {
        await sendNotification({
          userId: recId,
          expediteurId: req.user.id,
          projetId: task.projet_id,
          tacheId: task.id,
          type: "comment_added",
          titre: "Nouveau commentaire",
          message: `${req.user.nom} a commenté la carte "${task.titre}" : "${req.body.contenu.slice(0, 65)}"`,
          io: req.io,
        });
      }
    }

    res.status(201).json({ success: true, data: full });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Commentaire introuvable" });
    if (comment.auteur_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    await comment.destroy();
    res.json({ success: true, message: "Commentaire supprimé" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
