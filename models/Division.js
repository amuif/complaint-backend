const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Division = sequelize.define(
  'Division',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name_en: { type: DataTypes.STRING(100), allowNull: false },
    name_am: { type: DataTypes.STRING(100), allowNull: false },
    name_af: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_en: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_af: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_am: { type: DataTypes.STRING(100), allowNull: false },
    office_number: { type: DataTypes.STRING(100), allowNull: false },
    profile_picture: { type: DataTypes.STRING(255), allowNull: true },
    subcity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'subcities', key: 'id' },
    },
    sector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'sectors', key: 'id' },
    },
  },
  {
    tableName: 'divisions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['sector_id'], name: 'idx_division_sector', unique: false },
      { fields: ['subcity_id'], name: 'idx_division_subcity', unique: false }, // Added index
    ],
  }
);

Division.associate = (models) => {
  // ✅ CORRECT: Sector relationship
  Division.belongsTo(models.Sector, {
    foreignKey: 'sector_id',
    as: 'sector',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  // ✅ CORRECT: Subcity relationship with proper foreign key
  Division.belongsTo(models.Subcity, {
    foreignKey: 'subcity_id', // Fixed: using subcity_id
    as: 'subcity',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  // ✅ Add hasMany relationships
  Division.hasMany(models.Department, {
    foreignKey: 'division_id',
    as: 'departments',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Division.hasMany(models.Admin, {
    foreignKey: 'division_id',
    as: 'admins',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Division.hasMany(models.Employee, {
    foreignKey: 'division_id',
    as: 'employees',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

module.exports = Division;
