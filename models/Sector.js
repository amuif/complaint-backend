const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sector = sequelize.define(
  'Sector',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name_en: { type: DataTypes.STRING(100), allowNull: false },
    name_am: { type: DataTypes.STRING(100), allowNull: false },
    name_af: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_en: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_am: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_af: { type: DataTypes.STRING(100), allowNull: false },
    office_location_en: { type: DataTypes.STRING(50), allowNull: true },
    office_location_am: { type: DataTypes.STRING(50), allowNull: true },
    office_location_af: { type: DataTypes.STRING(50), allowNull: true },
    profile_picture: { type: DataTypes.STRING(255), allowNull: true },
    subcity_id: { type: DataTypes.INTEGER, allowNull: false }
  },
  {
    tableName: 'sectors',
    timestamps: true, // Enable Sequelize timestamps
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Sector.associate = (models) => {
  // Organizational Structure (hasMany)
  Sector.hasMany(models.Division, {
    foreignKey: 'sector_id',
    as: 'divisions',
  });

  Sector.hasMany(models.Department, {
    foreignKey: 'sector_id',
    as: 'departments',
  });

  Sector.hasMany(models.Team, {
    foreignKey: 'sector_id',
    as: 'teams',
  });

  Sector.hasMany(models.Office, {
    foreignKey: 'sector_id',
    as: 'offices',
  });

  // People
  Sector.hasMany(models.Admin, {
    foreignKey: 'sector_id',
    as: 'admins',
  });

  Sector.hasMany(models.Employee, {
    foreignKey: 'sector_id',
    as: 'employees',
  });

  // Complaints
  Sector.hasMany(models.Complaint, {
    foreignKey: 'sector_id',
    as: 'internal_complaints',
  });

  Sector.hasMany(models.PublicComplaint, {
    foreignKey: 'sector_id',
    as: 'public_complaints',
  });

  // Feedback
  Sector.hasMany(models.Feedback, {
    foreignKey: 'sector_id',
    as: 'internal_feedbacks',
  });

  Sector.hasMany(models.PublicFeedback, {
    foreignKey: 'sector_id',
    as: 'public_feedbacks',
  });

  // Ratings
  Sector.hasMany(models.Rating, {
    foreignKey: 'sector_id',
    as: 'internal_ratings',
  });
  Sector.hasMany(models.Subcity, {
    foreignKey: 'subcity_id',
    as: 'subcity',
  });


  Sector.hasMany(models.PublicRating, {
    foreignKey: 'sector_id',
    as: 'public_ratings',
  });

  // Activity Logs
  Sector.hasMany(models.ActivityLog, {
    foreignKey: 'sector_id',
    as: 'activity_logs',
  });
};

module.exports = Sector;
