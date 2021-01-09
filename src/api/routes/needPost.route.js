const Router = require("express").Router();
const { makeSureLoggedIn } = require("../middlewares/auth.middleware");

const {
  addPost,
  uploadImages,
  getPostById,
  getPostsByUser,
  getAllNeedPost,
  searchNeedPosts,
  createNewReactionOnNeedPost,
  updatePostById,
  getPostsOfCurrentUser,
} = require("../controllers/needPost.controller");

const {
  paramsNeedPostValidation,
} = require("../validations/needPost.validation");

const { postShareInsertValidation } = require("../validations/post.validation");

const { upload } = require("../libs/uploadFile");

/* Create new post */

Router.route("/").post(makeSureLoggedIn, addPost);

Router.route("/").get(makeSureLoggedIn, getPostsByUser);

Router.route("/me").get(makeSureLoggedIn, getPostsOfCurrentUser);

Router.route("/all").get(getAllNeedPost);

Router.route("/search").get(searchNeedPosts);

Router.route("/:id").patch(
  makeSureLoggedIn,
  // videoBeforeInsertValidate,
  updatePostById
);

Router.route("/:postID").get(makeSureLoggedIn, getPostById);

Router.route("/upload-images").post(
  makeSureLoggedIn,
  upload.array("images", 17),
  uploadImages
);

Router.route("/:postID/reaction/:reactionType").post(
  makeSureLoggedIn,
  paramsNeedPostValidation,
  createNewReactionOnNeedPost
);

module.exports = Router;
