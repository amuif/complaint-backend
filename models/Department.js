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
    subcity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'subcities', key: 'id' },
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
      { fields: ['subcity_id'], name: 'idx_dept_subcity' },
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
    as: 'division',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Department.belongsTo(models.Subcity, {
    foreignKey: 'subcity_id',
    as: 'subcity',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Department.belongsTo(models.Sector, {
    foreignKey: 'sector_id',
    as: 'sector',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Department.hasMany(models.Admin, {
    foreignKey: 'department_id',
    as: 'admins',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Department.hasMany(models.Employee, {
    foreignKey: 'department_id',
    as: 'employees',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Department.hasMany(models.Team, {
    foreignKey: 'department_id',
    as: 'teams',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Department.hasMany(models.Office, {
    foreignKey: 'department_id',
    as: 'offices',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Department.hasMany(models.Complaint, {
    foreignKey: 'department_id',
    as: 'internal_complaints',
  });

  Department.hasMany(models.PublicFeedback, {
    foreignKey: 'department_id',
    as: 'public_feedbacks',
  });

  Department.hasMany(models.PublicRating, {
    foreignKey: 'department_id',
    as: 'public_ratings',
  });
};

module.exports = Department;
