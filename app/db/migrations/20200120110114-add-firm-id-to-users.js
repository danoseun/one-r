'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'firm_id', {
      type: Sequelize.UUID,
      references: {
        model: 'Firms',
        key: 'id',
        as: 'firm_id',
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'firm_id')
  }
};

