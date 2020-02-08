'use strict';
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    phone: {
      allowNull: false,
      type: DataTypes.BIGINT,
      unique: true
    },
    description: DataTypes.TEXT
  }, {});
  Channel.associate = function(models) {
    // associations can be defined here
    Channel.belongsTo(models.Firm, {
      foreignKey: 'firm_id',
      onDelete: 'CASCADE'
    })
    Channel.hasMany(models.Conversation, {foreignKey: 'channel_id'})
  };
  return Channel;
};