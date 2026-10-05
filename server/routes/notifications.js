const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", notificationController.getNotifications);
router.route("/read-all")
  .put(notificationController.markAllAsRead)
  .patch(notificationController.markAllAsRead)
  .post(notificationController.markAllAsRead);

router.route("/clear-all")
  .delete(notificationController.clearAllNotifications)
  .post(notificationController.clearAllNotifications);

router.route("/:id/read")
  .put(notificationController.markAsRead)
  .patch(notificationController.markAsRead)
  .post(notificationController.markAsRead);

router.route("/:id/delete")
  .delete(notificationController.deleteNotification)
  .post(notificationController.deleteNotification);

router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
