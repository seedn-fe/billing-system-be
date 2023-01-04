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
    amount: {
      type: DataTypes.INTEGER,
    },
    buyer_name: {
      type: DataTypes.STRING,
    },
    buyer_email: {
      type: DataTypes.STRING,
    },
    buyer_tel: {
      type: DataTypes.STRING,
    },
  });
  return History;
};
