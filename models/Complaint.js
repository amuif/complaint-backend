const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define(
  'Complaint',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    complaint_name: { type: DataTypes.STRING(100), allowNull: true },
    phone_number: { type: DataTypes.STRING(15), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: true },
    complaint_description: { type: DataTypes.TEXT, allowNull: true },

    department_id: { type: DataTypes.INTEGER, allowNull: true },
    division_id: { type: DataTypes.INTEGER, allowNull: true },
    sector_id: { type: DataTypes.INTEGER, allowNull: true },
    office_id: { type: DataTypes.INTEGER, allowNull: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: true },
    subcity_id: { type: DataTypes.INTEGER, allowNull: true },
    responded_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    response: { type: DataTypes.TEXT, allowNull: true },

    team_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'teams',
        key: 'id',
      },
    },

    woreda: { type: DataTypes.STRING(100), allowNull: true },
    service_type: { type: DataTypes.STRING(100), allowNull: true },

    complaint_type: {
      type: DataTypes.ENUM(
        'service_quality',
        'staff_behavior',
        'facility_issue',
        'process_delay',
        'other'
      ),
      defaultValue: 'other',
      allowNull: false,
    },

    voice_note: { type: DataTypes.STRING(255), allowNull: true },
    complaint_source: { type: DataTypes.STRING(255), allowNull: false },

    status: {
      type: DataTypes.ENUM('submitted', 'under_review', 'investigating', 'resolved', 'closed'),
      defaultValue: 'submitted',
      allowNull: false,
    },

    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal',
      allowNull: false,
    },

    assigned_admin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'admins', key: 'id' },
    },

    admin_notes: { type: DataTypes.TEXT, allowNull: true },
    resolution_summary: { type: DataTypes.TEXT, allowNull: true },
    citizen_satisfaction_rating: { type: DataTypes.INTEGER, allowNull: true },
    follow_up_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    follow_up_date: { type: DataTypes.DATE, allowNull: true },
    resolved_at: { type: DataTypes.DATE, allowNull: true },

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
    tableName: 'complaints',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['phone_number'], name: 'idx_pub_complaint_phone' },
      { fields: ['status'], name: 'idx_pub_complaint_status' },
      { fields: ['department_id'], name: 'idx_pub_complaint_dept' },
      { fields: ['division_id'], name: 'idx_pub_complaint_div' },
      { fields: ['sector_id'], name: 'idx_pub_complaint_sector' },
      { fields: ['office_id'], name: 'idx_pub_complaint_office' },
      { fields: ['complaint_type'], name: 'idx_pub_complaint_type' },
      { fields: ['created_at'], name: 'idx_pub_complaint_date' },
    ],
  }
);

// Associations
Complaint.associate = (models) => {
  Complaint.belongsTo(models.Employee, {
    foreignKey: 'employee_id',
    as: 'employee',
  });

  Complaint.belongsTo(models.Admin, {
    foreignKey: 'assigned_admin',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    as: 'admin',
  });

  Complaint.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
  });

  Complaint.belongsTo(models.Division, {
    foreignKey: 'division_id',
    as: 'division',
  });

  Complaint.belongsTo(models.Sector, {
    foreignKey: 'sector_id',
    as: 'sector',
  });
  Complaint.belongsTo(models.Team, {
    foreignKey: 'team_id',
    as: 'team',
  });

  Complaint.belongsTo(models.Office, {
    foreignKey: 'office_id',
    as: 'office',
  });
};

module.exports = Complaint;
