'use strict';
/**
 * @Note When a Firm is to be deleted, unset firm_id on all associated users so we don't run into ghost firms situation
 */

module.exports = (sequelize, DataTypes) => {
  const Firm = sequelize.define('Firm', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM('active', 'downgraded', 'pending'),
      defaultValue: 'pending'
    }
  }, {});
  Firm.associate = function(models) {
    // associations can be defined here
    Firm.hasMany(models.User, {foreignKey: 'firm_id'})
    Firm.hasOne(models.FirmConfig, {foreignKey: 'firm_id'})
  };
  return Firm;
};
