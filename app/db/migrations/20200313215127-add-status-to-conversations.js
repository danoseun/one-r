'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Conversations', 'status', {
      type: Sequelize.ENUM('open', 'in-progress', 'closed'),
      defaultValue: 'open'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Conversations', 'status').then(() => {
      return queryInterface.sequelize.query('DROP type "enum_Conversations_status"')
    })
  }
};

