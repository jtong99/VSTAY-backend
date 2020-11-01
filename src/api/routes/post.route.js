const Router = require("express").Router();
const { makeSureLoggedIn } = require("../middlewares/auth.middleware");

const { addPost } = require("../controllers/post.controller");

const { postInsertValidation } = require("../validations/post.validation");

/* Create new post */

Router.route("/").post(postInsertValidation, addPost);

module.exports = Router;
