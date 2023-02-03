const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5001;
const bodyParser = require("body-parser");
const db = require("./models");
const controllers = require("./controllers/index");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("this is working");
});

controllers.forEach((controller) => {
  controller(app);
});

db.sequelize.sync().then((req) => {
  app.listen(port, () => {
    console.log("server running");
  });
});
