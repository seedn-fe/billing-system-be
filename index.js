const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const db = require("./models");
const {
  createContract,
  requestInitialPay,
  getAmount,
  handleWebhook,
  updateContract,
} = require("./controllers/dbContollers");
const { getTable, getHistory } = require("./controllers/apiControllers");
const nodemailer = require("nodemailer");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.put("/contract", updateContract);
app.post("/contract", createContract);
app.post("/billings", requestInitialPay);
app.post("/iamport-callback/schedule", handleWebhook);
app.get("/contract/:id", getAmount);
app.get("/table", getTable);
app.post("/history", getHistory);
app.get("/", (req, res) => {
  res.send("this is working");
});

const transporter = nodemailer.createTransport({
  service: "naver",
  host: "smtp.naver.com",
  port: 465,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const options = {
  from: process.env.EMAIL_ADDRESS,
  to: "hank29206880@gmail.com",
  subject: "결제가 완료되었습니다",
  text: "결제가 완료됨.",
};

transporter.sendMail(options, function (err, info) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Sent:", info.response);
});

db.sequelize.sync().then((req) => {
  app.listen(port, () => {
    console.log("server running");
  });
});
