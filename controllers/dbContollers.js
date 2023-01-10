const axios = require("axios");
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

const createHistory = async (req, res) => {
  const {
    customer_uid,
    merchant_uid,
    buyer_name,
    buyer_email,
    buyer_tel,
    amount,
  } = req.body;
  History.create({
    customer_uid,
    merchant_uid,
    amount,
    buyer_name,
    buyer_email,
    buyer_tel,
  });
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
  const { access_token } = getToken.data.response; // 인증 토큰

  // 결제(재결제) 요청
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
      const response = await axios({
        url: `https://api.iamport.kr/subscribe/payments/schedule`,
        method: "post",
        headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
        data: {
          customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
          schedules: [
            {
              merchant_uid: `mid_${new Date().getTime()}`, // 주문 번호
              schedule_at: Math.floor(
                new Date("2023-01-10T11:20:00").getTime() / 1000
              ), // 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
              amount,
              name: `리프 정기결제_예약${merchant_uid}`,
              buyer_name,
              buyer_tel,
            },
          ],
        },
      });
      console.log(response);
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
  Contract.findAll({ where: { merchant_uid: id } })
    .then((contract) => {
      res.send(contract);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = { createContract, createHistory, getAmount };
