const Router = require("express").Router();
const { makeSureLoggedIn } = require("../middlewares/auth.middleware");

const { getCurrentUser } = require("../controllers/user.controller");

Router.route("/me").get(makeSureLoggedIn, getCurrentUser);

module.exports = Router;
