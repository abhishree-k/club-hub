const { Sequelize } = require('sequelize');
const path = require('path');

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Sequelize
const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL, {
    // Production uses a remote DB; URL must be provided via env variable
    dialect: 'sqlite',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  })
  : new Sequelize({
    // Development uses local SQLite
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || path.join(__dirname, '../database.sqlite'),
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true
    }
  });

// Test DB connection and exit if failure
(async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected (${isProduction ? 'production' : 'development'})`);
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1); // Stop app if DB is unreachable
  }
})();

module.exports = sequelize;
