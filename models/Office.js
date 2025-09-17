const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Office = sequelize.define(
  'Office',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Office names
    name_en: { type: DataTypes.STRING(100), allowNull: false },
    name_am: { type: DataTypes.STRING(100), allowNull: false },
    name_af: { type: DataTypes.STRING(100), allowNull: false },

    // Identifiers
    office_number: { type: DataTypes.STRING(20), allowNull: true },

    // Foreign keys
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'departments', key: 'id' },
    },
    sector_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'sectors', key: 'id' },
    },
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'divisions', key: 'id' },
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'teams', key: 'id' },
    },

    // Office details
    description: { type: DataTypes.TEXT, allowNull: true },
    floor: { type: DataTypes.STRING(20), allowNull: true },
    location: { type: DataTypes.STRING(200), allowNull: true },

    // Office status
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

    // Contact information
    phone: { type: DataTypes.STRING(15), allowNull: true },
    email: { type: DataTypes.STRING(100), allowNull: true },

    // Additional
    services_offered: { type: DataTypes.TEXT, allowNull: true },
    opening_hours: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '8:00 AM - 5:00 PM',
    },
  },
  {
    tableName: 'offices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['department_id'], name: 'idx_office_dept' },
      { fields: ['is_active'], name: 'idx_office_active' },
      { fields: ['office_number'], name: 'idx_office_number' },
    ],
  }
);

module.exports = Office;
