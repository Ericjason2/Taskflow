const { Op } = require("sequelize");
const { Notification, User, Project, Task } = require("../models/associations");

// Helper: Create a notification and broadcast via Socket.io
exports.sendNotification = async ({
  userId,
  expediteurId = null,
  projetId = null,
  tacheId = null,
  type = "info",
  titre,
  message,
  io = null,
}) => {
  try {
    if (!userId) return null;
    const notif = await Notification.create({
      user_id: userId,
      expediteur_id: expediteurId,
      projet_id: projetId,
      tache_id: tacheId,
      type,
      titre,
      message,
      lu: false,
    });
    const full = await Notification.findByPk(notif.id, {
      include: [
        { model: User, as: "expediteur", attributes: ["id", "nom", "email", "avatar"] },
        { model: Project, as: "projet", attributes: ["id", "titre", "couleur"] },
        { model: Task, as: "tache", attributes: ["id", "titre"] },
      ],
    });
    if (io) {
      io.to(`user_${userId}`).emit("new_notification", full);
    }
    return full;
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
};

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: User, as: "expediteur", attributes: ["id", "nom", "email", "avatar"] },
        { model: Project, as: "projet", attributes: ["id", "titre", "couleur"] },
        { model: Task, as: "tache", attributes: ["id", "titre"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    const unreadCount = await Notification.count({
      where: {
        user_id: req.user.id,
        [Op.or]: [{ lu: false }, { lu: 0 }, { lu: null }],
      },
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notifId = parseInt(req.params.id, 10);
    if (isNaN(notifId)) {
      return res.status(400).json({ success: false, message: "ID invalide" });
    }
    const where =
      req.user.role === "admin"
        ? { id: notifId }
        : { id: notifId, user_id: req.user.id };
    const notif = await Notification.findOne({ where });
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification introuvable" });
    }
    await notif.update({ lu: true });
    res.json({ success: true, message: "Notification marquée comme lue", data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { lu: true },
      { where: { user_id: req.user.id } }
    );
    res.json({ success: true, message: "Toutes les notifications sont marquées comme lues" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notifId = parseInt(req.params.id, 10);
    if (isNaN(notifId)) {
      return res.status(400).json({ success: false, message: "ID invalide" });
    }
    const where =
      req.user.role === "admin"
        ? { id: notifId }
        : { id: notifId, user_id: req.user.id };
    const notif = await Notification.findOne({ where });
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification introuvable" });
    }
    await notif.destroy();
    res.json({ success: true, message: "Notification supprimée" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/clear-all
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.destroy({ where: { user_id: req.user.id } });
    res.json({ success: true, message: "Toutes les notifications ont été supprimées" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
