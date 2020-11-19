const Router = require("express").Router();
const { makeSureLoggedIn } = require("../middlewares/auth.middleware");

const {
  addPost,
  uploadImages,
  addSharePost,
  getPostsByUser,
  getPostById,
} = require("../controllers/post.controller");

const { postShareInsertValidation } = require("../validations/post.validation");

const { upload } = require("../libs/uploadFile");

/* Create new post */

Router.route("/").post(makeSureLoggedIn, postShareInsertValidation, addPost);

Router.route("/upload-images").post(
  makeSureLoggedIn,
  upload.array("images", 17),
  uploadImages
);

Router.route("/").get(makeSureLoggedIn, getPostsByUser);

Router.route("/:postID").get(makeSureLoggedIn, getPostById);

module.exports = Router;
