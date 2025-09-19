const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PublicComplaint = require('./PublicComplaint');

const ComplaintAttachment = sequelize.define(
  'ComplaintAttachment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    complaint_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_type: DataTypes.STRING,
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'complaint_attachments',
    timestamps: false,
  }
);

// Association
PublicComplaint.hasOne(ComplaintAttachment, {
  foreignKey: 'complaint_id',
  as: 'attachment',
});
ComplaintAttachment.belongsTo(PublicComplaint, {
  foreignKey: 'complaint_id',
  as: 'complaint',
});

module.exports = ComplaintAttachment;
