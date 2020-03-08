'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Conversations', 'lastMessageAt', {
      type: Sequelize.DATE
    }).then(() => queryInterface.sequelize.query('UPDATE "Conversations" SET "lastMessageAt" = "updatedAt"'))
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Conversations', 'firm_id')
  }
};
