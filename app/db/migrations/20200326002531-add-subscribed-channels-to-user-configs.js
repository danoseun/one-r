'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('UserConfigs', 'subscribedChannels', {
      allowNull: false,
      type: Sequelize.ARRAY(Sequelize.UUID),
      defaultValue: []
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('UserConfigs', 'subscribedChannels')
  }
};
