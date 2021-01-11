const Router = require("express").Router();
const {
  makeSureLoggedIn,
  makeSureAdmin,
} = require("../middlewares/auth.middleware");

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
  updatePostById,
  getPostByCurrentUser,
  getAllPostByType,
  getDataCount,
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

Router.route("/me").get(makeSureLoggedIn, getPostByCurrentUser);

Router.route("/all").get(getAllPost);

Router.route("/type/:type").get(
  makeSureLoggedIn,
  makeSureAdmin,
  getAllPostByType
);

Router.route("/search").get(searchSharePosts);

Router.route("/count").get(makeSureLoggedIn, getDataCount);

Router.route("/status").patch(makeSureLoggedIn, updatePostStatus);

Router.route("/related-location/:postID").get(
  makeSureLoggedIn,
  getRelatedPostBasedOnPostedLocation
);

Router.route("/:id").patch(
  makeSureLoggedIn,
  // videoBeforeInsertValidate,
  updatePostById
);

Router.route("/:postID").get(makeSureLoggedIn, getPostById);

Router.route("/:postID/reaction/:reactionType").post(
  makeSureLoggedIn,
  paramsSharePostValidation,
  createNewReactionOnPost
);

module.exports = Router;
