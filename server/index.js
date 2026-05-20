require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const { sequelize } = require("./models/associations");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const { errorHandler, notFound } = require("./middleware/error");

const app = express();
const server = http.createServer(app);

// Configure CORS origins
const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const origins = [clientUrl];

  // In production, also allow all *.vercel.app domains (for Vercel deployments)
  if (process.env.NODE_ENV === "production") {
    origins.push(/\.vercel\.app$/);
  }

  return origins;
};

const corsOrigins = getAllowedOrigins();

// Socket.io
const io = new Server(server, {
  cors: { origin: corsOrigins, methods: ["GET", "POST"] },
});

// Attach io to req
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: corsOrigins, credentials: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Trop de requêtes, réessayez plus tard" },
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projet_id/tasks", taskRoutes);

// Health check
app.get("/api/health", (_req, res) =>
  res.json({ status: "OK", timestamp: new Date().toISOString() }),
);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Socket.io events
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("join_project", (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`Socket ${socket.id} joined project_${projectId}`);
  });

  socket.on("leave_project", (projectId) => {
    socket.leave(`project_${projectId}`);
  });

  socket.on("task_update", (data) => {
    socket.to(`project_${data.projectId}`).emit("task_updated", data);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Sync DB & start
const PORT = process.env.PORT || 5000;

async function initializeDB() {
  try {
    await sequelize.sync({ force: false });
    console.log("🗄️  Base de données synchronisée");

    // Create or reset admin account
    const { User } = require("./models/associations");
    const adminEmail = "admin@taskflow.io";
    const adminPassword = "admin123";

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      // Update admin password to ensure it's correctly hashed
      await existingAdmin.update({ password: adminPassword });
      console.log("👤 Compte admin mis à jour: admin@taskflow.io / admin123");
    } else {
      // Create new admin
      await User.create({
        nom: "Admin TaskFlow",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        bio: "Administrateur de la plateforme TaskFlow",
      });
      console.log("👤 Compte admin créé: admin@taskflow.io / admin123");
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation:", err);
    throw err;
  }
}

initializeDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Serveur TaskFlow démarré sur http://localhost:${PORT}`);
      console.log(`📡 Socket.io actif`);
      console.log(`🌐 Environnement: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion BDD:", err);
    process.exit(1);
  });

module.exports = { app, io };
