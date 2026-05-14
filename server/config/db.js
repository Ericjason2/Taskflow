const { Sequelize } = require("sequelize");
const path = require("path");

let sequelize;

if (
  process.env.USE_SQLITE === "true" ||
  process.env.NODE_ENV === "development"
) {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "../database/taskflow.sqlite"),
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      ssl: { require: true, rejectUnauthorized: false },
    },
  );
}

module.exports = sequelize;
