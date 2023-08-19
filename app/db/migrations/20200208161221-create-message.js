'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      sender: {
        type: Sequelize.JSONB
      },
      content: {
        type: Sequelize.TEXT
      },
      contentType: {
        allowNull: false,
        type: Sequelize.ENUM('TEXT', 'IMAGE', 'VIDEO'),
        default: 'TEXT'
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      videoUrl: {
        type: Sequelize.STRING
      },
      conversation_id: {
        allowNull: false,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Conversations',
          key: 'id',
          as: 'conversation_id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Messages');
  }
};