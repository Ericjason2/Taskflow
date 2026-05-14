const { Op } = require("sequelize");
const {
  Project,
  User,
  Task,
  ProjectMember,
  Activity,
} = require("../models/associations");

// Utility: log activity
const logActivity = async (
  type,
  description,
  userId,
  projetId = null,
  tacheId = null,
  meta = {},
) => {
  try {
    await Activity.create({
      type,
      description,
      user_id: userId,
      projet_id: projetId,
      tache_id: tacheId,
      meta,
    });
  } catch (_) {}
};

exports.getProjects = async (req, res) => {
  try {
    const {
      search,
      statut,
      priorite,
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "DESC",
    } = req.query;
    const where = {};

    // Apply search filter
    if (search)
      where[Op.or] = [
        { titre: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];

    // Apply status and priority filters
    if (statut) where.statut = statut;
    if (priorite) where.priorite = priorite;

    // Build visibility filter
    let visibilityWhere;

    if (req.user.role === "admin") {
      // Admin sees ALL projects
      visibilityWhere = {}; // No restriction
    } else {
      // Users see only: their own projects + projects they are member of
      const memberProjectIds = (
        await ProjectMember.findAll({
          where: { user_id: req.user.id },
          attributes: ["projet_id"],
        })
      ).map((m) => m.projet_id);

      visibilityWhere = {
        [Op.or]: [
          { createur_id: req.user.id },
          { id: { [Op.in]: memberProjectIds } },
        ],
      };
    }

    // Merge visibility with other filters
    const finalWhere = { ...where, ...visibilityWhere };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Project.findAndCountAll({
      where: finalWhere,
      include: [
        {
          model: User,
          as: "createur",
          attributes: ["id", "nom", "email", "avatar"],
        },
        {
          model: User,
          as: "membres",
          attributes: ["id", "nom", "email", "avatar"],
          through: { attributes: ["role"] },
        },
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    // Add task counts
    const projectsWithStats = await Promise.all(
      rows.map(async (p) => {
        const tasks = await Task.findAll({ where: { projet_id: p.id } });
        const stats = {
          total: tasks.length,
          todo: 0,
          in_progress: 0,
          review: 0,
          done: 0,
        };
        tasks.forEach((t) => stats[t.statut]++);
        return { ...p.toJSON(), stats };
      }),
    );

    res.json({
      success: true,
      data: projectsWithStats,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const {
      titre,
      description,
      statut,
      priorite,
      couleur,
      date_debut,
      date_fin,
      membres,
    } = req.body;
    const project = await Project.create({
      titre,
      description,
      statut,
      priorite,
      couleur,
      date_debut,
      date_fin,
      createur_id: req.user.id,
    });
    // Add creator as owner
    await ProjectMember.create({
      projet_id: project.id,
      user_id: req.user.id,
      role: "owner",
    });
    // Add other members
    if (membres && membres.length > 0) {
      await Promise.all(
        membres.map((m) =>
          ProjectMember.create({
            projet_id: project.id,
            user_id: m.id || m,
            role: m.role || "editor",
          }),
        ),
      );
    }
    await logActivity(
      "project_created",
      `Projet "${titre}" créé`,
      req.user.id,
      project.id,
    );
    const full = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: "createur",
          attributes: ["id", "nom", "email", "avatar"],
        },
        {
          model: User,
          as: "membres",
          attributes: ["id", "nom", "email", "avatar"],
          through: { attributes: ["role"] },
        },
      ],
    });
    res.status(201).json({ success: true, message: "Projet créé", data: full });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "createur",
          attributes: ["id", "nom", "email", "avatar"],
        },
        {
          model: User,
          as: "membres",
          attributes: ["id", "nom", "email", "avatar"],
          through: { attributes: ["role"] },
        },
        {
          model: Task,
          as: "taches",
          include: [
            { model: User, as: "assigne", attributes: ["id", "nom", "avatar"] },
            { model: User, as: "createur", attributes: ["id", "nom"] },
          ],
        },
      ],
    });
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });
    if (project.createur_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Seul le créateur peut modifier ce projet",
      });
    }
    await project.update(req.body);
    await logActivity(
      "project_updated",
      `Projet "${project.titre}" modifié`,
      req.user.id,
      project.id,
    );
    res.json({ success: true, message: "Projet mis à jour", data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });
    if (project.createur_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    await Task.destroy({ where: { projet_id: project.id } });
    await ProjectMember.destroy({ where: { projet_id: project.id } });
    await project.destroy();
    res.json({ success: true, message: "Projet supprimé" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });
    if (project.createur_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Seul le créateur peut ajouter des membres",
      });
    }

    const { user_id, role = "editor" } = req.body;
    const exists = await ProjectMember.findOne({
      where: { projet_id: req.params.id, user_id },
    });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Déjà membre du projet" });
    await ProjectMember.create({
      projet_id: req.params.id,
      user_id,
      role,
    });
    const user = await User.findByPk(user_id, {
      attributes: ["id", "nom", "email", "avatar"],
    });
    res.json({ success: true, message: "Membre ajouté", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable" });
    if (project.createur_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Seul le créateur peut retirer des membres",
      });
    }

    await ProjectMember.destroy({
      where: { projet_id: req.params.id, user_id: req.params.userId },
    });
    res.json({ success: true, message: "Membre retiré" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const memberProjectIds = (
      await ProjectMember.findAll({
        where: { user_id: userId },
        attributes: ["projet_id"],
      })
    ).map((m) => m.projet_id);
    const projects = await Project.findAll({
      where: {
        [Op.or]: [
          { createur_id: userId },
          { id: { [Op.in]: memberProjectIds } },
        ],
      },
    });
    const projectIds = projects.map((p) => p.id);
    const tasks = await Task.findAll({
      where: { projet_id: { [Op.in]: projectIds } },
    });
    const myTasks = tasks.filter((t) => t.assigne_a === userId);
    const stats = {
      total_projets: projects.length,
      projets_actifs: projects.filter((p) => p.statut === "actif").length,
      projets_termines: projects.filter((p) => p.statut === "terminé").length,
      total_taches: tasks.length,
      mes_taches: myTasks.length,
      taches_todo: tasks.filter((t) => t.statut === "todo").length,
      taches_en_cours: tasks.filter((t) => t.statut === "in_progress").length,
      taches_terminees: tasks.filter((t) => t.statut === "done").length,
      taches_en_retard: tasks.filter(
        (t) =>
          t.echeance &&
          new Date(t.echeance) < new Date() &&
          t.statut !== "done",
      ).length,
    };
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "nom", "avatar"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
