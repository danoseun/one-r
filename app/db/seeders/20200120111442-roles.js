import uuidV4 from 'uuid/v4'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [
      {id: uuidV4(), name: 'admin', createdAt: (new Date(Date.now())).toISOString(), updatedAt: (new Date(Date.now())).toISOString()},
      {id: uuidV4(), name: 'agent', createdAt: (new Date(Date.now())).toISOString(), updatedAt: (new Date(Date.now())).toISOString()},
      {id: uuidV4(), name: 'manager', createdAt: (new Date(Date.now())).toISOString(), updatedAt: (new Date(Date.now())).toISOString()}
    ], {});
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Roles', null, {});
  }
};