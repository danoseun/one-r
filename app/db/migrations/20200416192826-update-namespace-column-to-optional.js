'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Templates', 'namespace', {
      allowNull: true,
      type: Sequelize.STRING
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Templates', 'namespace', {
      allowNull: false,
      type: Sequelize.STRING
    })
  }
};
