const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sector = sequelize.define(
  'Sector',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name_en: { type: DataTypes.STRING(100), allowNull: false },
    name_af: { type: DataTypes.STRING(100), allowNull: false },
    name_am: { type: DataTypes.STRING(100), allowNull: false },
    office_number: { type: DataTypes.STRING(100), allowNull: false },
    profile_picture: { type: DataTypes.STRING(255), allowNull: true },
    appointed_person_en: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_af: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_am: { type: DataTypes.STRING(100), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'sectors', timestamps: false }
);

module.exports = Sector;
