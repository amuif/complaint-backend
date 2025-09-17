const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subcity = sequelize.define(
  'Subcity',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'subcity name in English',
    },
    name_am: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'subcity name in Amharic',
    },
    name_af: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'subcity name in Afan Oromo',
    },
    appointed_person_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'subcity leader name in English',
    },
    appointed_person_am: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'subcity leader name in Amharic',
    },
    appointed_person_af: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'subcity leader name in Oromo',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'subcities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Subcity.associate = function (models) {
  Subcity.hasMany(models.Complaint, { foreignKey: 'sub_city_id', as: 'complaints' });
  Subcity.hasMany(models.PublicComplaint, { foreignKey: 'sub_city_id', as: 'public_complaints' });
  Subcity.hasMany(models.Rating, { foreignKey: 'sub_city_id', as: 'ratings' });
  Subcity.hasMany(models.PublicRating, { foreignKey: 'sub_city_id', as: 'public_ratings' });
  Subcity.hasMany(models.Feedback, { foreignKey: 'sub_city_id', as: 'feedbacks' });
  Subcity.hasMany(models.PublicFeedback, { foreignKey: 'sub_city_id', as: 'public_feedbacks' });
};
module.exports = Subcity;
