const { Sequelize } = require("sequelize");
const path = require("path");

let sequelize;

const dbUrl = (process.env.DATABASE_URL || "").trim();
const isValidDbUrl =
  dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

if (isValidDbUrl) {
  // Production with valid DATABASE_URL (Railway Postgres, Supabase, Neon, etc.)
  sequelize = new Sequelize(dbUrl, {
    dialect: "postgres",
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else if (
  process.env.DB_NAME &&
  process.env.DB_USER &&
  process.env.DB_HOST &&
  process.env.USE_SQLITE !== "true"
) {
  // Production with individual PostgreSQL credentials
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    },
  );
} else {
  // SQLite fallback (Local dev or when no external DB is configured)
  if (dbUrl && !isValidDbUrl) {
    console.warn(
      `⚠️ DATABASE_URL invalide reçue ("${dbUrl}"). Repli automatique sur SQLite.`,
    );
  }
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "../database/taskflow.sqlite"),
    logging: false,
  });
}

module.exports = sequelize;
