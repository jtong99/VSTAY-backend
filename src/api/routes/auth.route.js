const Router = require("express").Router();

const {
  signupProd,
  signupDev,
  signupVerify,
} = require("../controllers/auth.controller");

Router.route("/signup/prod/verify").post(signupProd);

Router.route("/signup/dev").post(signupDev);

Router.route("/signup/prod/create").get(signupVerify);

module.exports = Router;
