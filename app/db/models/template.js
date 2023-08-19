'use strict';
module.exports = (sequelize, DataTypes) => {
  const Template = sequelize.define('Template', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    body: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    namespace: DataTypes.STRING,
    data: {
      allowNull: false,
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    locale: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: 'en'
    },
    policy: {
      type: DataTypes.ENUM('DETERMINISTIC', 'FALLBACK')
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM('approved', 'pending'),
      defaultValue: 'pending'
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {});
  Template.associate = function(models) {
    // associations can be defined here
    Template.belongsTo(models.Firm, {
      foreignKey: 'firm_id',
      onDelete: 'CASCADE'
    })
  };
  return Template;
};