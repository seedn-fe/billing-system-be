const db = require("../models");

const getTable = async (req, res) => {
  const rows = [];
  try {
    const contracts = await db.Contract.findAll({ raw: true });
    const histories = await db.History.findAll({
      order: [["createdAt", "ASC"]],
      raw: true,
    });
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
      } = contract;
      let last_pay_date, status, acc, count, unpaid;
      const filtered = histories.filter(
        (history) => history.customer_uid === customer_uid
      );
      if (filtered.length > 0) {
        last_pay_date = new Intl.DateTimeFormat("kr").format(
          new Date(filtered[0].createdAt)
        );
        acc = filtered.length * amount;
        count = filtered.length;
        status = acc === count * amount ? "정상" : "비정상";
        unpaid = acc - count * amount;
      }
      const row = {
        key: index,
        id: index,
        고객이름: buyer_name,
        결제대수: device_count,
        월단위금액: amount / device_count,
        월결제총액: amount,
        마지막결제일: last_pay_date || "미결제",
        상태: status || "미결제",
        연체금액: (unpaid && String(unpaid)) || "없음",
        계약기간: `${start_date}~${end_date}`,
        결제누적금액: (acc && count && `${acc}원/${count}회`) || "미결제",
        담당자: manager,
        연락처: `${buyer_tel}`,
        customer_uid,
      };
      rows.push(row);
    });
    res.send(rows);
  } catch (err) {
    res.send(err);
  }
};

const getHistory = async (req, res) => {
  const { customer_uid } = req.body;
  try {
    const histories = await db.History.findAll({
      where: { customer_uid },
      raw: true,
    });
    res.send(histories);
  } catch (err) {
    res.send(err);
  }
};

module.exports = { getTable, getHistory };
