'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Conversations', 'firm_id', {
      allowNull: false,
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'Firms',
        key: 'id',
        as: 'firm_id',
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Conversations', 'firm_id')
  }
};
