import bcrypt from 'bcrypt'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    status: {
      allowNull: false,
      type: DataTypes.ENUM('pending', 'confirmed', 'disabled'),
      defaultValue: 'pending'
    }
  }, {
    hooks: {
      beforeCreate: user => {
        if (user.password)
          user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
      },
      beforeUpdate: user => {
        if (user.changed('password'))
          user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
      }
    }
  });
  User.associate = function(models) {
    // associations can be defined here
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      onDelete: 'CASCADE'
    })
    User.belongsTo(models.Firm, {foreignKey: 'firm_id'})
  };
  return User;
};
