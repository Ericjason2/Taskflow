const { Sequelize } = require("sequelize");
const path = require("path");

let sequelize;

if (process.env.DATABASE_URL) {
  // Production with DATABASE_URL (Render Postgres, Supabase, Neon, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
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
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "../database/taskflow.sqlite"),
    logging: false,
  });
}

module.exports = sequelize;
