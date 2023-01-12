const axios = require("axios");
const { Contract, History } = require("../models");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "naver",
  host: "smtp.naver.com",
  port: 465,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

const updateContract = (req, res) => {
  const { buyer_tel, buyer_name, buyer_email, customer_uid } = req.body;
  Contract.update(
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
  Contract.create({
    customer_uid,
    amount,
    device_count: deviceCount,
    start_date: startDate,
    end_date: endDate,
    unit_size: unitSize,
    manager,
  }).catch((err) => {
    console.log(err);
    res.status(400).json({ message: "계약생성에 실패했습니다" });
  });
  res.status(200).json({
    link: `http://localhost:3000/payment?merchant_uid=${merchant_uid}&customer_uid=${customer_uid}`,
  });
};

const requestInitialPay = async (req, res) => {
  const { customer_uid, merchant_uid, amount, buyer_email } = req.body;
  try {
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
    try {
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
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

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
        imp_key: "2734043607034140",
        imp_secret:
          "GrPTv68uoWFd2wVQH7HM3fLIwK4zsgsYZuJK9Oc4WPxzScv8DUZVRUlwpzjgVBxAztdNGBo9xiJcQ3LW", // REST API Secret
      },
    });
    const { access_token } = getToken.data.response;
    try {
      const getPaymentData = await axios({
        url: `https://api.iamport.kr/payments/${imp_uid}`,
        method: "get",
        headers: { Authorization: access_token },
      });
      const paymentData = getPaymentData.data.response;
      const { status, customer_uid } = paymentData;
      if (status === "paid") {
        Contract.findAll({ where: { customer_uid } })
          .then((contract) => {
            const { amount, buyer_name, buyer_email, buyer_tel } =
              contract[0].dataValues;
            History.create({
              imp_uid,
              merchant_uid,
              customer_uid,
              amount,
              buyer_name,
              buyer_email,
              buyer_tel,
            });
            const pay_time = Math.floor(new Date().getTime() / 1000 + 216000);
            axios({
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
          })
          .catch((err) => console.log(err));
      } else {
        console.log(status);
      }
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createContract,
  requestInitialPay,
  getAmount,
  handleWebhook,
  updateContract,
};
