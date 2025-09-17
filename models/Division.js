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
    appointed_person_af: { type: DataTypes.STRING(100), allowNull: false },
    appointed_person_am: { type: DataTypes.STRING(100), allowNull: false },
    office_number: { type: DataTypes.STRING(100), allowNull: false },
    profile_picture: { type: DataTypes.STRING(255), allowNull: true },

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
    indexes: [{ fields: ['sector_id'], name: 'idx_division_sector', unique: false }],
  }
);

Division.associate = (models) => {
  Division.belongsTo(models.Sector, {
    foreignKey: 'sector_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

module.exports = Division;
