const { Op } = require("sequelize");
const {
  Task,
  User,
  Comment,
  Activity,
  Project,
} = require("../models/associations");

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
    if (assigne_a) where.assigne_a = assigne_a;
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
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { projet_id } = req.params;
    const { titre, description, statut, priorite, assigne_a, echeance, tags } =
      req.body;

    // Verify project exists and user can modify it
    const project = await Project.findByPk(projet_id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });
    if (project.createur_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Seul le créateur du projet peut créer des tâches",
      });
    }

    const task = await Task.create({
      titre,
      description,
      statut,
      priorite,
      assigne_a,
      echeance,
      tags,
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

    // Verify user is project creator
    const project = await Project.findByPk(projet_id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });
    if (project.createur_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Seul le créateur du projet peut modifier les tâches",
      });
    }

    const oldStatut = task.statut;
    await task.update(req.body);
    if (req.body.statut && req.body.statut !== oldStatut) {
      const labels = {
        todo: "À faire",
        in_progress: "En cours",
        review: "En révision",
        done: "Terminé",
      };
      await logActivity(
        "task_status_changed",
        `Tâche "${task.titre}" → ${labels[req.body.statut]}`,
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

    // Verify user is project creator
    const project = await Project.findByPk(projet_id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });
    if (project.createur_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
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
    await task.update({ statut: req.body.statut });
    res.json({ success: true, message: "Statut mis à jour", data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Comments
exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
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
