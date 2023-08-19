'use strict';
module.exports = (sequelize, DataTypes) => {
  const FirmConfig = sequelize.define('FirmConfig', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    domain: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {});
  FirmConfig.associate = function(models) {
    // associations can be defined here
    FirmConfig.belongsTo(models.Firm, {
      foreignKey: 'firm_id',
      onDelete: 'CASCADE'
    })
  };
  return FirmConfig;
};