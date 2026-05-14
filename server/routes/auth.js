const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");
const { protect, restrictTo } = require("../middleware/auth");
const { validate } = require("../middleware/error");

router.post("/register", ctrl.registerValidation, validate, ctrl.register);
router.post("/login", ctrl.loginValidation, validate, ctrl.login);
router.get("/me", protect, ctrl.getMe);
router.put("/profile", protect, ctrl.updateProfile);
router.put("/password", protect, ctrl.changePassword);
router.get("/users", protect, ctrl.getAllUsers);
router.delete("/users/:userId", protect, ctrl.deleteUser);

module.exports = router;
