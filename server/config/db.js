const { Sequelize } = require("sequelize");
const path = require("path");

let sequelize;

const dbUrl = (process.env.DATABASE_URL || "").trim();
const isValidDbUrl =
  dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

const createSqliteInstance = () => {
  return new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "../database/taskflow.sqlite"),
    logging: false,
  });
};

if (isValidDbUrl) {
  try {
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
  } catch (err) {
    console.error(
      "❌ Erreur lors de l'initialisation PostgreSQL, repli sur SQLite:",
      err.message,
    );
    sequelize = createSqliteInstance();
  }
} else if (
  process.env.DB_NAME &&
  process.env.DB_USER &&
  process.env.DB_HOST &&
  process.env.USE_SQLITE !== "true"
) {
  try {
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
  } catch (err) {
    console.error(
      "❌ Erreur lors de l'initialisation PostgreSQL, repli sur SQLite:",
      err.message,
    );
    sequelize = createSqliteInstance();
  }
} else {
  if (dbUrl) {
    console.warn(
      `⚠️ DATABASE_URL invalide reçue ("${dbUrl}"). Repli automatique sur SQLite.`,
    );
  }
  sequelize = createSqliteInstance();
}

module.exports = sequelize;
