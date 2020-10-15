const Router = require("express").Router();

const {
  signupProd,
  signupDev,
  signupVerify,
  signin,
} = require("../controllers/auth.controller");

const {
  validateSignupInput,
  validateSigninInput,
  checkUserEmail,
} = require("../validations/auth.validation");

Router.route("/signup/prod/verify").post(validateSignupInput, signupProd);

Router.route("/signup/dev").post(validateSignupInput, signupDev);

Router.route("/signup/prod/create").get(signupVerify);

Router.route("/signin").post(validateSigninInput, checkUserEmail, signin);

module.exports = Router;
