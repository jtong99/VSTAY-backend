const Router = require("express").Router();
const { makeSureLoggedIn } = require("../middlewares/auth.middleware");

const {
  addPost,
  uploadImages,
  getPostById,
  getPostsByUser,
  getAllNeedPost,
  searchNeedPosts,
} = require("../controllers/needPost.controller");

const { postShareInsertValidation } = require("../validations/post.validation");

const { upload } = require("../libs/uploadFile");

/* Create new post */

Router.route("/").post(makeSureLoggedIn, addPost);

Router.route("/").get(makeSureLoggedIn, getPostsByUser);

Router.route("/all").get(getAllNeedPost);

Router.route("/search").get(searchNeedPosts);

Router.route("/:postID").get(makeSureLoggedIn, getPostById);

Router.route("/upload-images").post(
  makeSureLoggedIn,
  upload.array("images", 17),
  uploadImages
);

module.exports = Router;
