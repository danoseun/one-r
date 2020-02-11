'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE "Channels" DROP CONSTRAINT "Channels_phone_key"')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Channels', 'phone', {
      allowNull: false,
      type: Sequelize.BIGINT,
      unique: true
    })
  }
};
