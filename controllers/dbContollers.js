const { Contract, History } = require("../models");

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

const createHistory = (req, res) => {
  const params = req.body;
};

const getAmount = (req, res) => {
  const id = req.params.id;
  Contract.findAll({ where: { merchant_uid: id } })
    .then((contract) => {
      res.send(contract);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = { createContract, createHistory, getAmount };
