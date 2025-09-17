const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PublicFeedback = sequelize.define(
  'Feedback',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Feedback provider name',
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: 'Contact phone',
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Contact email',
    },

    sector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Target Sector',
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Target department',
    },
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Target division',
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Target team',
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Target employee',
    },
    subcity_id: { type: DataTypes.INTEGER, allowNull: true },

    subject: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Feedback subject',
    },
    feedback_type: {
      type: DataTypes.ENUM('suggestion', 'compliment', 'concern', 'service_improvement', 'general'),
      defaultValue: 'general',
      comment: 'Type of feedback',
    },
    feedback_text: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Detailed feedback',
    },
    service_experienced: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Service received',
    },

    overall_satisfaction: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Overall satisfaction rating',
    },
    would_recommend: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Would recommend service',
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Anonymous feedback flag',
    },

    admin_response: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Admin response to feedback',
    },
    response_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Response timestamp',
    },

    status: {
      type: DataTypes.ENUM('new', 'reviewed', 'responded', 'archived'),
      defaultValue: 'new',
      comment: 'Feedback status',
    },
  },
  {
    tableName: 'feedback',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Public citizen feedback system',
    indexes: [
      { fields: ['phone_number'], name: 'idx_feedback_phone' },
      { fields: ['email'], name: 'idx_feedback_email' },
      { fields: ['subject'], name: 'idx_feedback_subject' },
      { fields: ['service_experienced'], name: 'idx_feedback_service' },
      { fields: ['created_at'], name: 'idx_feedback_created' },
      { fields: ['response_date'], name: 'idx_feedback_response_date' },
      { fields: ['feedback_type'], name: 'idx_feedback_type' },
      { fields: ['status'], name: 'idx_feedback_status' },
      { fields: ['overall_satisfaction'], name: 'idx_feedback_satisfaction' },
      { fields: ['would_recommend'], name: 'idx_feedback_recommend' },
      { fields: ['is_anonymous'], name: 'idx_feedback_anonymous' },
      { fields: ['department_id', 'status'], name: 'idx_feedback_dept_status' },
      { fields: ['feedback_type', 'status'], name: 'idx_feedback_type_status' },
      { fields: ['sector_id', 'created_at'], name: 'idx_feedback_sector_date' },
      {
        fields: ['employee_id', 'created_at'],
        name: 'idx_feedback_employee_date',
      },
      {
        fields: ['feedback_type', 'overall_satisfaction'],
        name: 'idx_feedback_type_satisfaction',
      },
    ],
  }
);

PublicFeedback.associate = (models) => {
  PublicFeedback.belongsTo(models.Sector, {
    foreignKey: 'sector_id',
    as: 'sector',
  });

  PublicFeedback.belongsTo(models.Division, {
    foreignKey: 'division_id',
    as: 'division',
  });

  PublicFeedback.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
  });

  PublicFeedback.belongsTo(models.Team, {
    foreignKey: 'team_id',
    as: 'team',
  });

  PublicFeedback.belongsTo(models.Employee, {
    foreignKey: 'employee_id',
    as: 'employee',
  });
};
module.exports = PublicFeedback;
