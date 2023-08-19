'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Channels', 'type', {
      allowNull: false,
      type: Sequelize.ENUM('DEFAULT', 'CUSTOM'),
      defaultValue: 'DEFAULT'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Channels', 'type').then(() => {
      return queryInterface.sequelize.query('DROP type "enum_Channels_type"')
    })
  }
};

