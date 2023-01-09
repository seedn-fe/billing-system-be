const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const db = require("./models");
const {
  createContract,
  createHistory,
  getAmount,
} = require("./controllers/dbContollers");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/contract", createContract);
app.post("/billings", createHistory);
app.get("/contract/:id", getAmount);
app.post("/");

db.sequelize.sync().then((req) => {
  app.listen(port, () => {
    console.log("server running");
  });
});
