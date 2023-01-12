const { Contract, History } = require("../models");

const getTable = async (req, res) => {
  const rows = [];
  const contracts = await Contract.findAll();
  const histories = await History.findAll();
  contracts.forEach((contract, index) => {
    const {
      amount,
      device_count,
      buyer_name,
      manager,
      buyer_tel,
      start_date,
      end_date,
      customer_uid,
    } = contract.dataValues;
    let last_pay_date, status, acc, count;
    const filtered = histories.filter(
      (history) => history.dataValues.customer_uid === customer_uid
    );
    if (filtered.length > 0) {
    }
    const row = {
      key: index,
      id: index,
      고객이름: buyer_name,
      결제대수: device_count,
      월단위금액: amount / device_count,
      월결제총액: amount,
      마지막결제일: "정보가 없습니다",
      상태: "정보가 없습니다",
      연체금액: "정보가 없습니다",
      계약기간: `${start_date}~${end_date}`,
      결제누적금액: "정보가 없습니다",
      담당자: manager,
      연락처: `${buyer_tel}`,
    };
    rows.push(row);
  });
  res.send(rows);
};

module.exports = { getTable };
