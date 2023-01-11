const axios = require("axios");
const { Contract, History } = require("../models");

const createContract = (req, res) => {
  const { amount, deviceCount, unitSize, startDate, endDate, name } = req.body;
  const customer_uid = `customer_${new Date().getTime()}`;
  const merchant_uid = `mid_${new Date().getTime()}`;
  Contract.create({
    customer_uid,
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
  res.status(200).json({
    link: `http://localhost:3000/payment?merchant_uid=${merchant_uid}&customer_uid=${customer_uid}`,
  });
};

const createHistory = async (req, res) => {
  const {
    imp_uid,
    customer_uid,
    merchant_uid,
    buyer_name,
    buyer_email,
    buyer_tel,
    amount,
  } = req.body;
  try {
    History.create({
      imp_uid,
      customer_uid,
      merchant_uid,
      amount,
      buyer_name,
      buyer_email,
      buyer_tel,
    });
  } catch (err) {
    res.send(err);
  }
  const getToken = await axios({
    url: "https://api.iamport.kr/users/getToken",
    method: "post", // POST method
    headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
    data: {
      imp_key: "2734043607034140", // REST API 키e
      imp_secret:
        "GrPTv68uoWFd2wVQH7HM3fLIwK4zsgsYZuJK9Oc4WPxzScv8DUZVRUlwpzjgVBxAztdNGBo9xiJcQ3LW", // REST API Secret
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
      res.send({ msg: "결제성공" });
    } else {
      res.send({ msg: "결제실패" });
    }
  } else {
    res.send({ msg: "카드사 요청 실패" });
  }
};

const getAmount = (req, res) => {
  const id = req.params.id;
  Contract.findAll({ where: { customer_uid: id } })
    .then((contract) => {
      res.send(contract);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleWebhook = async (req, res) => {
  const { imp_uid, merchant_uid } = req.body;
  let getToken, getPaymentData;
  try {
    getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" },
      data: {
        imp_key: "2734043607034140",
        imp_secret:
          "GrPTv68uoWFd2wVQH7HM3fLIwK4zsgsYZuJK9Oc4WPxzScv8DUZVRUlwpzjgVBxAztdNGBo9xiJcQ3LW", // REST API Secret
      },
    });
  } catch (err) {
    res.send(err);
  }
  const { access_token } = getToken.data.response;

  try {
    getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`,
      method: "get",
      headers: { Authorization: access_token },
    });
  } catch (err) {
    res.send(err);
  }
  const paymentData = getPaymentData.data.response;
  const { status, customer_uid } = paymentData;
  if (status === "paid") {
    History.findAll({ where: { customer_uid } })
      .then(async (data) => {
        const { amount, buyer_name, buyer_email, buyer_tel } =
          data[0].dataValues;
        History.create({
          imp_uid,
          merchant_uid,
          customer_uid,
          amount,
          buyer_name,
          buyer_email,
          buyer_tel,
        });
        const pay_time = Math.floor(new Date().getTime() / 1000 + 100);
        try {
          await axios({
            url: `https://api.iamport.kr/subscribe/payments/schedule`,
            method: "post",
            headers: { Authorization: access_token },
            data: {
              customer_uid,
              schedules: [
                {
                  merchant_uid: `mid_${new Date().getTime()}`, // 주문 번호
                  schedule_at: pay_time,
                  amount,
                  name: `리프 정기결제_예약${merchant_uid}`,
                  buyer_name,
                  buyer_tel,
                },
              ],
            },
          });
        } catch (err) {
          res.send(err);
        }
      })
      .catch((err) => {
        console.log("History 에러", err);
      });
  } else {
    console.log(status);
  }
};

module.exports = { createContract, createHistory, getAmount, handleWebhook };
