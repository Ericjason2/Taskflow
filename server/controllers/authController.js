const { User } = require("../models/associations");
const { generateToken } = require("../middleware/auth");
const { body } = require("express-validator");

exports.registerValidation = [
  body("nom")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Le nom doit contenir au moins 2 caractères"),
  body("email").isEmail().normalizeEmail().withMessage("Email invalide"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
];

exports.loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Email invalide"),
  body("password").notEmpty().withMessage("Mot de passe requis"),
];

exports.register = async (req, res) => {
  try {
    const { nom, email, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Cet email est déjà utilisé" });
    }
    const user = await User.create({
      nom,
      email,
      password,
      role: role === "admin" ? "admin" : "membre",
    });
    const token = generateToken(user.id);
    res
      .status(201)
      .json({ success: true, message: "Compte créé avec succès", token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Email ou mot de passe incorrect" });
    }
    const token = generateToken(user.id);
    res.json({ success: true, message: "Connexion réussie", token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { nom, bio, avatar } = req.body;
    const updates = {};
    if (nom) updates.nom = nom;
    if (bio !== undefined) updates.bio = bio;
    if (avatar) updates.avatar = avatar;
    await req.user.update(updates);
    res.json({ success: true, message: "Profil mis à jour", user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!(await req.user.comparePassword(current_password))) {
      return res
        .status(400)
        .json({ success: false, message: "Mot de passe actuel incorrect" });
    }
    await req.user.update({ password: new_password });
    res.json({ success: true, message: "Mot de passe modifié" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "nom", "email", "role", "avatar", "createdAt"],
    });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur actuel est admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas les permissions pour effectuer cette action",
      });
    }

    // Empêcher un admin de se supprimer lui-même
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas vous supprimer vous-même",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Supprimer les projets créés par cet utilisateur
    const {
      Project,
      Task,
      Comment,
      ProjectMember,
      Activity,
    } = require("../models/associations");

    // 1. Supprimer les commentaires créés par cet utilisateur
    await Comment.destroy({ where: { auteur_id: userId } });

    // 2. Retirer les tâches assignées à cet utilisateur (set NULL)
    await Task.update({ assigne_a: null }, { where: { assigne_a: userId } });

    // 3. Supprimer les tâches créées par cet utilisateur (dans les projets qu'il crée)
    const projectsCreatedByUser = await Project.findAll({
      where: { createur_id: userId },
    });
    const projectIds = projectsCreatedByUser.map((p) => p.id);
    if (projectIds.length > 0) {
      await Task.destroy({ where: { projet_id: projectIds } });
    }

    // 4. Retirer l'utilisateur de ProjectMembers
    await ProjectMember.destroy({ where: { user_id: userId } });

    // 5. Supprimer les activités de cet utilisateur
    await Activity.destroy({ where: { user_id: userId } });

    // 6. Supprimer les projets créés par cet utilisateur
    await Project.destroy({ where: { createur_id: userId } });

    // 7. Supprimer l'utilisateur
    await user.destroy();

    res.json({
      success: true,
      message: `L'utilisateur ${user.nom} a été supprimé`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
