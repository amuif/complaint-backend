const sequelize = require('../config/database');
const models = require('../models');

const initDb = async () => {
  try {
    await sequelize.authenticate();

    // Database connected successfully

    // Clean up orphaned ratings
    try {
      const { QueryTypes } = require('sequelize');
      // const deletedCount = await sequelize.query('DELETE FROM ratings WHERE employee_id IS NULL', {
      //   type: QueryTypes.DELETE,
      // });

      // Cleaned up orphaned ratings if any existed
    } catch (cleanupError) {
      // Continue even if cleanup fails
    }
    const tableExists = await sequelize.getQueryInterface().tableExists('admins');
    if (!tableExists) {
      console.log('Creating database tables...');
      await sequelize.sync({ alter: false });
    } else {
      console.log('Database tables already exist, skipping sync');
    }
    // All models synchronized successfully
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Database initialization failed:', error.message);
      console.error('Please ensure:');
      console.error('1. MySQL server is running');
      console.error('2. Database credentials are correct in .env file');
      console.error("3. Database 'office_management' exists");
    }
    throw error;
  }
};

module.exports = { initDb };
