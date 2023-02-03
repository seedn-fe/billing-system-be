const router = require("express").Router();
const db = require("../models");

const updateContract = (req, res) => {
  const { buyer_tel, buyer_name, buyer_email, customer_uid } = req.body;
  db.Contract.update(
    {
      buyer_email,
      buyer_name,
      buyer_tel,
    },
    { where: { customer_uid } }
  );
};

const createContract = (req, res) => {
  const { amount, deviceCount, unitSize, startDate, endDate, manager } =
    req.body;
  const customer_uid = `customer_${new Date().getTime()}`;
  const merchant_uid = `mid_${new Date().getTime()}`;
  try {
    db.Contract.create({
      customer_uid,
      amount,
      device_count: deviceCount,
      start_date: startDate,
      end_date: endDate,
      unit_size: unitSize,
      manager,
    });
  } catch (err) {
    res.status(400).json({ message: "계약생성에 실패했습니다" });
  }
  res.status(200).json({
    link: `http://localhost:3000/payment?merchant_uid=${merchant_uid}&customer_uid=${customer_uid}`,
  });
};

const getAmount = async (req, res) => {
  const id = req.params.id;
  try {
    const contract = await db.Contract.findAll({
      where: { customer_uid: id },
      raw: true,
    });
    await res.send(contract);
  } catch (err) {
    res.send(err);
  }
};

router.put("/", updateContract);
router.post("/", createContract);
router.get("/:id", getAmount);

module.exports = function (app) {
  app.use("/contract", router);
};
