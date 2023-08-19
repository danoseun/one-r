'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Conversations', 'agent_id', {
      type: Sequelize.UUID,
      references: {
        model: 'Users',
        key: 'id',
        as: 'agent_id',
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Conversations', 'agent_id')
  }
};
