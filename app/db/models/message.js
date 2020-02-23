'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    sender: DataTypes.JSONB,
    content: DataTypes.TEXT,
    contentType: {
      allowNull: false,
      type: DataTypes.ENUM('TEXT', 'IMAGE', 'VIDEO'),
      default: 'TEXT'
    },
    imageUrl: DataTypes.STRING,
    videoUrl: DataTypes.STRING,
    docUrl: DataTypes.STRING
  }, {});
  Message.associate = function(models) {
    // associations can be defined here
    Message.belongsTo(models.Conversation, {
      foreignKey: 'conversation_id',
      onDelete: 'CASCADE'
    })
  };
  return Message;
};