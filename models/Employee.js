const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define(
  'Employee',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employee_id: { type: DataTypes.STRING(20) },
    first_name_en: { type: DataTypes.STRING(50), allowNull: true },
    first_name_am: { type: DataTypes.STRING(50), allowNull: true },
    first_name_af: { type: DataTypes.STRING(50), allowNull: true },
    middle_name_en: { type: DataTypes.STRING(50), allowNull: true },
    middle_name_am: { type: DataTypes.STRING(50), allowNull: true },
    middle_name_af: { type: DataTypes.STRING(50), allowNull: true },
    last_name_en: { type: DataTypes.STRING(50), allowNull: true },
    last_name_am: { type: DataTypes.STRING(50), allowNull: true },
    last_name_af: { type: DataTypes.STRING(50), allowNull: true },
    office_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'offices', key: 'id' },
    },
    office_number: { type: DataTypes.STRING(10), allowNull: true },
    floor_number: { type: DataTypes.INTEGER, allowNull: true },
    position_en: { type: DataTypes.STRING(100), allowNull: true },
    position_am: { type: DataTypes.STRING(100), allowNull: true },
    position_af: { type: DataTypes.STRING(100), allowNull: true },
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
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'departments', key: 'id' },
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'teams', key: 'id' },
    },

    subcity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'subcities', key: 'id' },
    },
    works_in_head_office: { type: DataTypes.BOOLEAN },

    email: { type: DataTypes.STRING(100), allowNull: true },
    phone: { type: DataTypes.STRING(15), allowNull: true },
    profile_picture: { type: DataTypes.STRING(255), allowNull: true },
    specializations: { type: DataTypes.TEXT, allowNull: true },
    years_of_service: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    education_level: { type: DataTypes.STRING(100), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: true },
    hire_date: { type: DataTypes.DATE, allowNull: true },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'employees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
      { fields: ['department_id'], name: 'idx_emp_dept' },
      { fields: ['is_active'], name: 'idx_emp_active' },
      { fields: ['first_name_en', 'last_name_en'], name: 'idx_emp_name_en' },
    ],
  }
);

Employee.associate = (models) => {
  Employee.hasMany(models.PublicComplaint, {
    foreignKey: 'employee_id',
    as: 'public_complaints',
  });
  Employee.belongsTo(models.Division, {
    foreignKey: 'division_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Employee.belongsTo(models.Office, {
    foreignKey: 'office_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Employee.belongsTo(models.Department, {
    foreignKey: 'department_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  Employee.belongsTo(models.Teams, {
    foreignKey: 'team_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};
module.exports = Employee;
