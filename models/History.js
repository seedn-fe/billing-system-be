module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define("History", {
    imp_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      primaryKey: true,
    },
    customer_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    merchant_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });
  return History;
};
