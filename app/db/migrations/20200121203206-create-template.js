'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Templates', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      body: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      namespace: {
        allowNull: false,
        type: Sequelize.STRING
      },
      data: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      locale: {
        allowNull: false,
        type: Sequelize.STRING
      },
      policy: {
        type: Sequelize.ENUM('DETERMINISTIC', 'FALLBACK')
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('approved', 'pending')
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      firm_id: {
        allowNull: false,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Firms',
          key: 'id',
          as: 'firm_id',
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
    return queryInterface.dropTable('Templates');
  }
};