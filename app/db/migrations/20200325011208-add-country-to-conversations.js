'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Conversations', 'country', {
      allowNull: false,
      type: Sequelize.STRING,
      defaultValue: 'NG'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Conversations', 'country')
  }
};
