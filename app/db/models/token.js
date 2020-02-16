import base64 from 'base64url'
import crypto from 'crypto'

module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('Token', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    value: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: base64(crypto.randomBytes(4).toString('hex'))
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM('confirmation', 'reset'),
      defaultValue: 'confirmation'
    }
  }, {});
  Token.associate = function(models) {
    // associations can be defined here
    Token.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    })
  };
  return Token;
};