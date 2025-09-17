const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define(
  'Department',
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
    sector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'sectors', key: 'id' },
    },
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'divisions', key: 'id' },
    },
  },
  {
    tableName: 'departments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['name_en'], name: 'idx_dept_name_en' },
      { fields: ['division_id'], name: 'departments_division_id' },
    ],
  }
);

Department.associate = (models) => {
  Department.hasMany(models.PublicComplaint, {
    foreignKey: 'department_id',
    as: 'complaints',
  });

  Department.belongsTo(models.Division, {
    foreignKey: 'division_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

module.exports = Department;
