'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      allowNull: false,
      type: DataTypes.ENUM('admin', 'manager', 'agent')
    }
  }, {});
  Role.associate = function(models) {
    // associations can be defined here
    Role.hasMany(models.User, {foreignKey: 'role_id'})
  };
  return Role;
};
