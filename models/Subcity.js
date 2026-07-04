const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subcity = sequelize.define(
  'Subcity',
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
  },
  {
    tableName: 'subcities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ fields: ['name_en'], name: 'idx_subcity_name_en' }],
  }
);

Subcity.associate = (models) => {
  Subcity.hasMany(models.Division, { foreignKey: 'subcity_id', as: 'divisions' });
  Subcity.hasMany(models.Department, { foreignKey: 'subcity_id', as: 'departments' });
  Subcity.hasMany(models.Sector, { foreignKey: 'subcity_id', as: 'sectors' });
  Subcity.hasMany(models.Team, { foreignKey: 'subcity_id', as: 'teams' });
  Subcity.hasMany(models.Employee, { foreignKey: 'subcity_id', as: 'employees' });
  Subcity.hasMany(models.Admin, { foreignKey: 'subcity_id', as: 'admins' });

  models.Division.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'subcity' });
  models.Department.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'subcity' });
  models.Sector.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'subcity' });
  models.Team.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'subcity' });
  models.Employee.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'subcity' });
  models.Admin.belongsTo(Subcity, { foreignKey: 'subcity_id', as: 'subcity' });
};

module.exports = Subcity;
