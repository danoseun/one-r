'use strict';
const phoneNumber = require('awesome-phonenumber')

module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    customer: DataTypes.JSONB,
    lastMessageAt: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('open', 'in-progress', 'closed'),
      defaultValue: 'open'
    },
    country: {
      type: DataTypes.STRING
    }
  }, {
    hooks: {
      beforeCreate: attributes => {
        const {phone} = attributes.customer
        if (phone)
          attributes.country = phoneNumber(`+${phone}`).getRegionCode()
      }
    }
  });
  Conversation.associate = function(models) {
    // associations can be defined here
    Conversation.belongsTo(models.Channel, {
      foreignKey: 'channel_id',
      onDelete: 'CASCADE'
    })
    Conversation.hasMany(models.Message, {foreignKey: 'conversation_id'})
    Conversation.belongsTo(models.User, {foreignKey: 'agent_id'})
  };
  return Conversation;
};