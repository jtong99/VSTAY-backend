const Router = require("express").Router();
const { makeSureLoggedIn } = require("../middlewares/auth.middleware");

const {
  addPost,
  uploadImages,
  addSharePost,
  getPostsByUser,
  getPostById,
  getAllPost,
  searchSharePosts,
  createNewReactionOnPost,
  getRelatedPostBasedOnPostedLocation,
  updatePostStatus,
} = require("../controllers/post.controller");

const {
  postShareInsertValidation,
  paramsSharePostValidation,
} = require("../validations/post.validation");

const { upload } = require("../libs/uploadFile");

/* Create new post */

Router.route("/").post(makeSureLoggedIn, postShareInsertValidation, addPost);

Router.route("/upload-images").post(
  makeSureLoggedIn,
  upload.array("images", 17),
  uploadImages
);

Router.route("/").get(makeSureLoggedIn, getPostsByUser);

Router.route("/all").get(getAllPost);

Router.route("/search").get(searchSharePosts);

Router.route("/status").patch(makeSureLoggedIn, updatePostStatus);

Router.route("/related-location/:postID").get(
  makeSureLoggedIn,
  getRelatedPostBasedOnPostedLocation
);

Router.route("/:postID").get(makeSureLoggedIn, getPostById);

Router.route("/:postID/reaction/:reactionType").post(
  makeSureLoggedIn,
  paramsSharePostValidation,
  createNewReactionOnPost
);

module.exports = Router;
