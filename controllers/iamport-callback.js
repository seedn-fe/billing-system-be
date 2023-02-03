const router = require("express").Router();
const db = require("../models");

const handleWebhook = async (req, res) => {
  console.log("------------------------");
  console.log("웹훅 호출됨");
  console.log("------------------------");
  const { imp_uid, merchant_uid } = req.body;
  try {
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" },
      data: {
        imp_key: "0588001860717135",
        imp_secret:
          "Xs3u5jTKTnGYwAKEAfoaz0wf0Um0CADzQ1ue4OSDIirsjvhTiJ3373ZKVWJl8WytVPcW8Zteceng6K30", // REST API Secret
      },
    });
    const { access_token } = getToken.data.response;
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`,
      method: "get",
      headers: { Authorization: access_token },
    });
    const paymentData = getPaymentData.data.response;
    const { status, customer_uid } = paymentData;
    if (status === "paid") {
      const contract = await db.Contract.findAll({
        where: { customer_uid },
        raw: true,
      });
      const { amount, buyer_name, buyer_email, buyer_tel, end_date } =
        contract[0];
      db.History.create({
        imp_uid,
        merchant_uid,
        customer_uid,
        amount,
        buyer_name,
        buyer_email,
        buyer_tel,
      });
      let next_pay_year = new Date().getFullYear();
      let next_pay_month = new Date().getMonth() + 1;
      if (next_pay_month === 12) {
        next_pay_year += 1;
        next_pay_month = 0;
      }
      const next_pay_date = new Date(
        `${next_pay_year}-${next_pay_month + 1}-25`
      );
      const unix_timestamp = Math.floor(next_pay_date.getTime() / 1000);
      const last_pay_timestamp = Math.floor(
        new Date(end_date).getTime() / 1000
      );
      if (unix_timestamp > last_pay_timestamp) return;
      axios({
        url: `https://api.iamport.kr/subscribe/payments/schedule`,
        method: "post",
        headers: { Authorization: access_token },
        data: {
          customer_uid,
          schedules: [
            {
              merchant_uid: `mid_${new Date().getTime()}`, // 주문 번호
              schedule_at: unix_timestamp,
              amount,
              name: `리프 정기결제_예약${merchant_uid}`,
              buyer_name,
              buyer_tel,
            },
          ],
        },
      });
    } else {
      console.log(status);
    }
  } catch (err) {
    res.send(err);
  }
};

router.post("/schedule", handleWebhook);

module.exports = function (app) {
  app.use("/iamport-callback", router);
};
