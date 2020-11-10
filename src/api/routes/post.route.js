const Router = require("express").Router();
const { makeSureLoggedIn } = require("../middlewares/auth.middleware");

const { addPost, uploadImages } = require("../controllers/post.controller");

const { postInsertValidation } = require("../validations/post.validation");

const { upload } = require("../libs/uploadFile");

/* Create new post */

Router.route("/").post(
  // postInsertValidation,
  makeSureLoggedIn,
  addPost
);

Router.route("/upload-images").post(
  // postInsertValidation,
  makeSureLoggedIn,
  upload.array("images", 17),
  uploadImages
);

module.exports = Router;
