const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PublicRating = sequelize.define(
  'PublicRating',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Contact Information
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Rater full name',
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: 'Contact phone',
    },

    // Service Information
    service_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Service being rated',
    },
    // Location References
    sector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Sector being rated',
    },
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Division being rated',
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Department being rated',
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the employee being rated',
    },

    subcity_id: { type: DataTypes.INTEGER, allowNull: true },
    // Rating Metrics
    overall_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Overall service rating',
      validate: { min: 1, max: 5 },
    },
    courtesy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'How polite, respectful, and considerate',
      validate: { min: 1, max: 5 },
    },
    punctuality: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Finishing task on time',
      validate: { min: 1, max: 5 },
    },
    knowledge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Knowledge that the employee displayed',
      validate: { min: 1, max: 5 },
    },
    staff_professionalism: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Staff rating',
      validate: { min: 1, max: 5 },
    },
    service_speed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Speed rating',
      validate: { min: 1, max: 5 },
    },
    facility_quality: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Facility rating',
      validate: { min: 1, max: 5 },
    },
    communication_quality: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Communication rating',
      validate: { min: 1, max: 5 },
    },

    // Additional Information
    rating_source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'public_rating',
    },

    additional_comments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional feedback',
    },
    visit_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Service visit date',
    },
    wait_time_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Waiting time in minutes',
    },
    issue_resolved: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Was issue resolved',
    },
    would_recommend: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Would recommend service',
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Rating verification status',
    },
  },
  {
    tableName: 'public_ratings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Public service rating system',
    indexes: [
      { fields: ['overall_rating'], name: 'idx_pub_rating_overall' },
      { fields: ['department_id'], name: 'idx_pub_rating_dept' },
      { fields: ['service_type'], name: 'idx_pub_rating_service' },
      { fields: ['phone_number'], name: 'idx_pub_rating_phone' },
      { fields: ['employee_id'], name: 'idx_pub_rating_employee' },
      { fields: ['visit_date'], name: 'idx_pub_rating_date' },
      { fields: ['is_verified'], name: 'idx_pub_rating_verified' },
    ],
  }
);

// Define associations
PublicRating.associate = (models) => {
  PublicRating.belongsTo(models.Sector, {
    foreignKey: 'sector_id',
    as: 'sector',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  PublicRating.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  PublicRating.belongsTo(models.Division, {
    foreignKey: 'division_id',
    as: 'division',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  PublicRating.belongsTo(models.Employee, {
    foreignKey: 'employee_id',
    as: 'employee',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

module.exports = PublicRating;
