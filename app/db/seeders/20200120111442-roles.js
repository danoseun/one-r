import uuidV4 from 'uuid/v4'

import {dateToISOString}  from '../../src/helpers/tools'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [
      {id: uuidV4(), name: 'admin', createdAt: dateToISOString(Date.now()), updatedAt: dateToISOString(Date.now())},
      {id: uuidV4(), name: 'agent', createdAt: dateToISOString(Date.now()), updatedAt: dateToISOString(Date.now())},
      {id: uuidV4(), name: 'manager', createdAt: dateToISOString(Date.now()), updatedAt: dateToISOString(Date.now())}
    ], {});
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Roles', null, {});
  }
};