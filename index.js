const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const axios = require("axios");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = require("./models");

const { Contract } = require("./models");
const { createContract } = require("./controllers/dbContollers");

app.post("/contract", createContract);

db.sequelize.sync().then((req) => {
  app.listen(5000, () => {
    console.log("server running");
  });
});
