const Router = require("express").Router();

const {
  signupProd,
  signupDev,
  signupVerify,
  signin,
  refreshToken,
  logout,
} = require("../controllers/auth.controller");
const {
  makeSureLoggedIn,
  checkUserPassword,
} = require("../middlewares/auth.middleware");

const {
  validateSignupInput,
  validateSigninInput,
  checkUserEmail,
} = require("../validations/auth.validation");

Router.route("/signup/prod/verify").post(validateSignupInput, signupProd);

Router.route("/signup/dev").post(validateSignupInput, signupDev);

Router.route("/signup/prod/create").get(signupVerify);

Router.route("/signin").post(
  validateSigninInput,
  checkUserEmail,
  checkUserPassword,
  signin
);

Router.route("/refresh-token").get(refreshToken);

Router.route("/logout").get(makeSureLoggedIn, logout);

module.exports = Router;
