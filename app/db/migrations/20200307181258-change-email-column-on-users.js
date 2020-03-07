'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Users', 'email', {
      allowNull: false,
      type: Sequelize.STRING,
      unique: true
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE "Users" DROP CONSTRAINT "Users_email_key"').then(() => {
      return queryInterface.changeColumn('Users', 'email', Sequelize.STRING)
    })
  }
};
