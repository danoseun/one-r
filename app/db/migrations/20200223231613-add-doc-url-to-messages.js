'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Messages', 'documentUrl', Sequelize.STRING)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Messages', 'documentUrl')
  }
};
