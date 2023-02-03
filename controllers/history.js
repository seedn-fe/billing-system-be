const router = require("express").Router();
const db = require("../models");

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

router.get("/", getHistory);

module.exports = function (app) {
  app.use("/history", router);
};
