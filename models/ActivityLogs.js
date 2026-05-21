const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define(
  'ActivityLog',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin who performed action',
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Action performed',
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Type of entity affected',
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of affected entity',
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional action details',
    },
    sector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'sector source for log',
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'activity_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['admin_id'], name: 'idx_log_admin' },
      { fields: ['action'], name: 'idx_log_action' },
      { fields: ['entity_type', 'entity_id'], name: 'idx_log_entity' },
      { fields: ['created_at'], name: 'idx_log_date' },
      { fields: ['sector_id'], name: 'idx_log_sector' },
    ],
    comment: 'System activity logging',
  }
);

// Associations
ActivityLog.associate = (models) => {
  ActivityLog.belongsTo(models.Admin, {
    foreignKey: 'admin_id',
    as: 'admin',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  // Add associations for sector and subcity if needed
  ActivityLog.belongsTo(models.Sector, {
    foreignKey: 'sector_id',
    as: 'sector',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

module.exports = ActivityLog;
