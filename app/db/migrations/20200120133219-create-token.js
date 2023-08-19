'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tokens', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      value: {
        allowNull: false,
        type: Sequelize.STRING
      },
      user_id: {
        allowNull: false,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
            model: 'Users',
            key: 'id',
            as: 'user_id',
        },
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM('confirmation', 'reset')
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
    return queryInterface.dropTable('Tokens');
  }
};