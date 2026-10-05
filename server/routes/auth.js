const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/authController");
const { protect, restrictTo } = require("../middleware/auth");
const { validate } = require("../middleware/error");

// Rate limiting on sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 100 : 25,
  message: {
    success: false,
    message: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, ctrl.registerValidation, validate, ctrl.register);
router.post("/login", authLimiter, ctrl.loginValidation, validate, ctrl.login);
router.get("/me", protect, ctrl.getMe);
router.put("/profile", protect, ctrl.updateProfile);
router.put("/password", protect, ctrl.changePassword);
router.get("/users", protect, ctrl.getAllUsers);
router.delete("/users/:userId", protect, ctrl.deleteUser);

module.exports = router;
