const { Sequelize } = require('sequelize');

// Sequelize Database Connection with environment variable support
let sequelize;

if (process.env.DB_DIALECT === 'sqlite') {
  // SQLite configuration
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './office_management.db',
    logging: false,
  });
} else {
  // MySQL configuration (default)
  sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'office_management',
    logging: false,
    retry: {
      max: 5,
      timeout: 60000,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

module.exports = sequelize;
