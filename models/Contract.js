module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define("Contract", {
    customer_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      primaryKey: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    device_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    start_date: {
      type: DataTypes.STRING,
    },
    end_date: {
      type: DataTypes.STRING,
    },
    buyer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    buyer_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    buyer_tel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  return Contract;
};
