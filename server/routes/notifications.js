const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", notificationController.getNotifications);
router.route("/read-all").put(notificationController.markAllAsRead).patch(notificationController.markAllAsRead);
router.delete("/clear-all", notificationController.clearAllNotifications);
router.route("/:id/read").put(notificationController.markAsRead).patch(notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
