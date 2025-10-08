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
    appointed_person_am: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_af: { type: DataTypes.STRING(100), allowNull: false },
    office_location_en: { type: DataTypes.STRING(50), allowNull: false },
    office_location_am: { type: DataTypes.STRING(50), allowNull: false },
    office_location_af: { type: DataTypes.STRING(50), allowNull: false },
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
      { fields: ['sector_id'], name: 'idx_division_sector' },
      { fields: ['subcity_id'], name: 'idx_division_subcity' },
    ],
  }
);

Division.associate = (models) => {
  // Organizational Structure (belongsTo)
  Division.belongsTo(models.Sector, {
    foreignKey: 'sector_id',
    as: 'sector',
  });

  Division.belongsTo(models.Subcity, {
    foreignKey: 'subcity_id',
    as: 'subcity',
  });

  // Organizational Structure (hasMany)
  Division.hasMany(models.Department, {
    foreignKey: 'division_id',
    as: 'departments',
  });

  Division.hasMany(models.Team, {
    foreignKey: 'division_id',
    as: 'teams',
  });

  Division.hasMany(models.Office, {
    foreignKey: 'division_id',
    as: 'offices',
  });

  // People
  Division.hasMany(models.Admin, {
    foreignKey: 'division_id',
    as: 'admins',
  });

  Division.hasMany(models.Employee, {
    foreignKey: 'division_id',
    as: 'employees',
  });

  // Complaints
  Division.hasMany(models.Complaint, {
    foreignKey: 'division_id',
    as: 'internal_complaints',
  });

  Division.hasMany(models.PublicComplaint, {
    foreignKey: 'division_id',
    as: 'public_complaints',
  });

  // Feedback
  Division.hasMany(models.Feedback, {
    foreignKey: 'division_id',
    as: 'internal_feedbacks',
  });

  Division.hasMany(models.PublicFeedback, {
    foreignKey: 'division_id',
    as: 'public_feedbacks',
  });

  // Ratings
  Division.hasMany(models.Rating, {
    foreignKey: 'division_id',
    as: 'internal_ratings',
  });

  Division.hasMany(models.PublicRating, {
    foreignKey: 'division_id',
    as: 'public_ratings',
  });
};

module.exports = Division;
