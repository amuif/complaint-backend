const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define(
  'Team',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name_am: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name_af: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    appointed_person_en: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_af: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_am: { type: DataTypes.STRING(100), allowNull: false },
    office_number: { type: DataTypes.STRING(100), allowNull: false },
    profile_picture: { type: DataTypes.STRING(255), allowNull: false },

    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id',
      },
    },

    office_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'offices',
        key: 'id',
      },
    },

    sector_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sectors',
        key: 'id',
      },
    },

    division_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'divisions',
        key: 'id',
      },
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'teams',
    timestamps: false,
    indexes: [
      { fields: ['department_id'] },
      { fields: ['office_id'] },
      { fields: ['sector_id'] },
      { fields: ['division_id'] },
    ],
  }
);
Team.associate = (models) => {
  Team.hasMany(models.PublicComplaint, {
    foreignKey: 'team_id',
    as: 'complaints',
  });
};

module.exports = Team;
