const { Contract } = require("../models");

const createContract = (req, res) => {
  const {
    amount,
    deviceCount,
    unitSize,
    startDate,
    endDate,
    name,
    merchant_uid,
  } = req.body;
  console.log(req.body);
  Contract.create({
    merchant_uid,
    amount,
    device_count: deviceCount,
    start_date: startDate,
    end_date: endDate,
    unit_size: unitSize,
    name,
  }).catch((err) => {
    console.log(err);
    res.status(400).json({ message: "계약생성에 실패했습니다" });
  });
  res.status(200).json({ link: `http://localhost:3000/${merchant_uid}` });
};

module.exports = { createContract };
