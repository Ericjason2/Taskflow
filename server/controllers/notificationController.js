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
    const whereClause =
      req.user.role === "admin" ? {} : { user_id: req.user.id };

    const notifications = await Notification.findAll({
      where: whereClause,
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
        ...whereClause,
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
    const whereClause =
      req.user.role === "admin"
        ? { id: notifId }
        : { id: notifId, user_id: req.user.id };

    const notif = await Notification.findOne({
      where: whereClause,
    });
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification introuvable" });
    }
    await notif.update({ lu: true });

    const countWhere =
      req.user.role === "admin" ? {} : { user_id: req.user.id };
    const unreadCount = await Notification.count({
      where: {
        ...countWhere,
        [Op.or]: [{ lu: false }, { lu: 0 }, { lu: null }],
      },
    });

    res.json({
      success: true,
      message: "Notification marquée comme lue",
      data: notif,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const whereClause =
      req.user.role === "admin" ? {} : { user_id: req.user.id };

    await Notification.update(
      { lu: true },
      { where: whereClause }
    );
    res.json({
      success: true,
      message: "Toutes les notifications sont marquées comme lues",
      unreadCount: 0,
    });
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
    const whereClause =
      req.user.role === "admin"
        ? { id: notifId }
        : { id: notifId, user_id: req.user.id };

    const notif = await Notification.findOne({
      where: whereClause,
    });
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification introuvable" });
    }
    await notif.destroy();

    const countWhere =
      req.user.role === "admin" ? {} : { user_id: req.user.id };
    const unreadCount = await Notification.count({
      where: {
        ...countWhere,
        [Op.or]: [{ lu: false }, { lu: 0 }, { lu: null }],
      },
    });

    res.json({ success: true, message: "Notification supprimée", unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
