const express = require("express");
const cors = require("cors");
const passport = require("passport");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");

const error = require("../api/middlewares/error");

const Router = require("../api/routes");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// enable CORS in Header
app.use(cors());

app.use(passport.initialize());
require("./passport").jwt(passport);

app.use("/uploads", express.static(path.join(__dirname, "../api/uploads")));

app.use(Router);

app.use(error.converter);

// handle 404 Not Found error
app.use(error.notFound);

// add a global error handler to catch the error responsed
app.use(error.handler);

module.exports = {
  app,
};
