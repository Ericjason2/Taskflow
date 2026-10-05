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
const notificationRoutes = require("./routes/notifications");
const { errorHandler, notFound } = require("./middleware/error");

const app = express();
const server = http.createServer(app);

// Configure CORS origins
const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const origins = [clientUrl];

  // In development, also allow any localhost/127.0.0.1 port (e.g. 5173, 5174, 5175...)
  if (process.env.NODE_ENV !== "production") {
    origins.push(/^http:\/\/localhost:\d+$/);
    origins.push(/^http:\/\/127\.0\.0\.1:\d+$/);
  }

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
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/api/health", (_req, res) =>
  res.json({
    status: "OK",
    version: "1.2.0",
    features: [
      "notifications",
      "checklists",
      "automations",
      "calendar",
      "command_palette",
      "custom_fields",
    ],
    timestamp: new Date().toISOString(),
  }),
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

  socket.on("join_user", (userId) => {
    socket.join(`user_${userId}`);
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

    // Ensure new columns exist on tasks and projects tables (SQLite & Postgres compatible)
    try {
      const [taskCols] = await sequelize.query("PRAGMA table_info(tasks);");
      if (Array.isArray(taskCols) && taskCols.length > 0) {
        const names = taskCols.map((c) => c.name);
        if (!names.includes("checklists")) await sequelize.query("ALTER TABLE tasks ADD COLUMN checklists TEXT;");
        if (!names.includes("couverture")) await sequelize.query("ALTER TABLE tasks ADD COLUMN couverture VARCHAR(255);");
        if (!names.includes("pieces_jointes")) await sequelize.query("ALTER TABLE tasks ADD COLUMN pieces_jointes TEXT;");
        if (!names.includes("custom_fields")) await sequelize.query("ALTER TABLE tasks ADD COLUMN custom_fields TEXT;");
      }
      const [projCols] = await sequelize.query("PRAGMA table_info(projects);");
      if (Array.isArray(projCols) && projCols.length > 0) {
        const names = projCols.map((c) => c.name);
        if (!names.includes("automations")) await sequelize.query("ALTER TABLE projects ADD COLUMN automations TEXT;");
        if (!names.includes("custom_fields_config")) await sequelize.query("ALTER TABLE projects ADD COLUMN custom_fields_config TEXT;");
      }
    } catch (_) {
      try {
        await sequelize.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS checklists TEXT;");
        await sequelize.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS couverture VARCHAR(255);");
        await sequelize.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pieces_jointes TEXT;");
        await sequelize.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS custom_fields TEXT;");
        await sequelize.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS automations TEXT;");
        await sequelize.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS custom_fields_config TEXT;");
      } catch (_) {}
    }

    // Initialize all demo accounts
    const { User } = require("./models/associations");
    const demoAccounts = [
      {
        nom: "Admin TaskFlow",
        email: "admin@taskflow.io",
        password: "admin123",
        role: "admin",
        bio: "Administrateur de la plateforme TaskFlow",
      },
      {
        nom: "Alice Martin",
        email: "alice@taskflow.io",
        password: "membre123",
        role: "membre",
        bio: "Développeuse Frontend Senior",
      },
      {
        nom: "Bob Dupont",
        email: "bob@taskflow.io",
        password: "membre123",
        role: "membre",
        bio: "Développeur Backend & DevOps",
      },
      {
        nom: "Claire Leblanc",
        email: "claire@taskflow.io",
        password: "membre123",
        role: "membre",
        bio: "Designer UX/UI",
      },
    ];

    for (const acc of demoAccounts) {
      const existing = await User.findOne({ where: { email: acc.email } });
      if (existing) {
        await existing.update({
          password: acc.password,
          role: acc.role,
          nom: acc.nom,
          bio: acc.bio,
        });
        console.log(`👤 Compte mis à jour: ${acc.email} (${acc.role})`);
      } else {
        await User.create(acc);
        console.log(`👤 Compte créé: ${acc.email} (${acc.role})`);
      }
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation:", err);
    throw err;
  }
}

initializeDB()
  .then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Serveur TaskFlow démarré sur le port ${PORT}`);
      console.log(`📡 Socket.io actif`);
      console.log(`🌐 Environnement: ${process.env.NODE_ENV || "development"}`);
    });
    // Render load balancer recommendations
    server.keepAliveTimeout = 120 * 1000;
    server.headersTimeout = 120 * 1000;
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion BDD:", err);
    process.exit(1);
  });

module.exports = { app, io };
