const router = require("express").Router();
const db = require("../models");
const nodemailer = require("nodemailer");
const config = require("config");

const transporter = nodemailer.createTransport({
  service: "naver",
  host: "smtp.naver.com",
  port: 465,
  auth: {
    user: config.email.EMAIL_ADDRESS,
    pass: config.email.EMAIL_PASSWORD,
  },
});

const requestInitialPay = async (req, res) => {
  const { customer_uid, merchant_uid, amount, buyer_email } = req.body;
  try {
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key: "0588001860717135", // REST API 키e
        imp_secret:
          "Xs3u5jTKTnGYwAKEAfoaz0wf0Um0CADzQ1ue4OSDIirsjvhTiJ3373ZKVWJl8WytVPcW8Zteceng6K30", // REST API Secret
      },
    });
    const { access_token } = getToken.data.response;
    const paymentResult = await axios({
      url: `https://api.iamport.kr/subscribe/payments/again`,
      method: "post",
      headers: { Authorization: access_token }, // 인증 토큰을 Authorization header에 추가
      data: {
        customer_uid,
        merchant_uid: `mid_${new Date().getTime()}`, // 새로 생성한 결제(재결제)용 주문 번호
        amount,
        name: `리프 정기결제${merchant_uid}`,
      },
    });
    const { code } = paymentResult.data;
    if (code === 0) {
      if (paymentResult.data.response.status === "paid") {
        const options = {
          from: process.env.EMAIL_ADDRESS,
          to: buyer_email,
          subject: "결제가 완료되었습니다",
          text: "결제 완료",
        };

        transporter.sendMail(options, function (err, info) {
          if (err) {
            console.log(err);
            return;
          }
          console.log("Sent:", info.response);
        });
        res.send({ msg: "결제성공" });
      } else {
        res.send({ msg: "결제실패" });
      }
    } else {
      res.send({ msg: "카드사 요청 실패" });
    }
  } catch (err) {
    res.send(err);
  }
};

router.post("/", requestInitialPay);

module.exports = function (app) {
  app.use("/billings", router);
};
