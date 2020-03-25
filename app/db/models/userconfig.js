'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserConfig = sequelize.define('UserConfig', {
    country: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: 'NG'
    }
  }, {});
  UserConfig.associate = function(models) {
    // associations can be defined here
    UserConfig.belongsTo(models.User, {foreignKey: 'user_id'})
  };
  return UserConfig;
};