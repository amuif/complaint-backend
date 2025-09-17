const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define(
  'Admin',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Admin username',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Hashed password',
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: 'Admin email address',
    },
    role: {
      type: DataTypes.ENUM('SuperAdmin', 'SuperAdminSupporter', 'Admin', 'Editor', 'Viewer'),
      allowNull: false,
      comment: 'Admin role level (SuperAdmin >Admin > Editor> Viewer)',
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Admin first name',
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Admin last name',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'City jurisdiction (optional for super roles)',
    },
    subcity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Subcity jurisdiction (required for SubCity* roles, NULL for super roles)',
      validate: {
        customValidator(value) {
          if (['SuperAdmin', 'SuperAdminSupporter'].includes(this.role) && value !== null) {
            throw new Error(
              'SuperAdmin and SuperAdminSupporter must have NULL subcity_id (global scope).'
            );
          }
          if (['SubCityAdmin', 'SubCityAdminSupporter'].includes(this.role) && value === null) {
            throw new Error('SubCityAdmin and SubCityAdminSupporter must have a valid subcity_id.');
          }
        },
      },
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Department assignment (optional)',
    },
    sector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin sector (optional)',
    },
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin division (optional)',
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: 'Contact phone',
    },
    profile_picture: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Profile picture URL',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Admin account status',
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last login timestamp',
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Failed login counter',
    },
    account_locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Account lock expiry',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Record creation timestamp',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Record update timestamp',
    },
  },
  {
    tableName: 'admins',
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    comment: 'Admin users with role-based access control',
    indexes: [{ fields: ['role'] }, { fields: ['is_active'] }],
  }
);

// Associations
Admin.associate = (models) => {
  Admin.belongsTo(models.Subcity, {
    foreignKey: 'subcity_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  Admin.belongsTo(models.Department, {
    foreignKey: 'department_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  Admin.belongsTo(models.Sector, {
    foreignKey: 'sector_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  Admin.belongsTo(models.Division, {
    foreignKey: 'division_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

module.exports = Admin;
