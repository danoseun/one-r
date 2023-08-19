'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'Messages',
      columnName: 'contentType',
      defaultValue: 'TEXT',
      newValues: ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'],
      enumName: 'enum_Messages_contentType'
    });
  },

  down: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'Messages',
      columnName: 'contentType',
      defaultValue: 'TEXT',
      newValues: ['TEXT', 'IMAGE', 'VIDEO'],
      enumName: 'enum_Messages_contentType'
    });
  }
};
