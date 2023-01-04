module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define("Customer", {
    customer_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      primaryKey: true,
    },
    buyer_name: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    buyer_tel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
    },
    last_pay_date: {
      type: DataTypes.DATE,
    },
  });
  return Customer;
};

//결제 누적금액, 횟수는 결제 이력에서 긁어오는걸로하기
