const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const axios = require("axios");
const { db } = require("./config/db");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
db.connect();
app.get("/", (req, res) => {
  db.query("SELECT * FROM Orders", (error, rows) => {
    if (error) throw error;
    res.send(rows);
  });
});

app.post("/payments/complete", async (req, res) => {
  try {
    const { imp_uid, merchant_uid } = req.body;
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" },
      data: {
        imp_key: "2734043607034140", // REST API 키
        imp_secret:
          "GrPTv68uoWFd2wVQH7HM3fLIwK4zsgsYZuJK9Oc4WPxzScv8DUZVRUlwpzjgVBxAztdNGBo9xiJcQ3LW", // REST API Secret
      },
    });
    const { access_token } = getToken.data.response;
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`,
      method: "get",
      headers: { Authorization: access_token },
    });
    const paymentData = getPaymentData.data.response;
    const amountToBePaid = 100; // 결제 되어야 하는 금액
    // 결제 검증하기
    const { amount, status } = paymentData;
    if (amount === amountToBePaid) {
      // 결제금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
      switch (status) {
        case "paid": // 결제 완료
          res.send({
            status: "success",
            message: "일반 결제 성공",
            paymentData,
          });
          break;
      }
    } else {
      // 결제금액 불일치. 위/변조 된 결제
      throw { status: "forgery", message: "위조된 결제시도" };
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
