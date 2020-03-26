'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserConfig = sequelize.define('UserConfig', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    country: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: 'NG'
    },
    subscribedChannels: {
      allowNull: false,
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    }
  }, {});
  UserConfig.associate = function(models) {
    // associations can be defined here
    UserConfig.belongsTo(models.User, {foreignKey: 'user_id'})
  };
  return UserConfig;
};