const Router = require("express").Router();
const { makeSureLoggedIn } = require("../middlewares/auth.middleware");

const { pushViewToPost } = require("../controllers/view.controller");

Router.route("/:postID").post(makeSureLoggedIn, pushViewToPost);

module.exports = Router;
