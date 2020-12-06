const Router = require("express").Router();
const { makeSureLoggedIn } = require("../middlewares/auth.middleware");

const { upload } = require("../libs/uploadFile");

const {
  validateUpdateCurrentUserInput,
  validateUpdateUserPasswordInput,
} = require("../validations/user.validation");

const {
  getCurrentUser,
  updateCurrentUserProfile,
  updateAvatar,
  getUserByUserId,
  updateCurrentUserPassword,
} = require("../controllers/user.controller");

Router.route("/me").get(makeSureLoggedIn, getCurrentUser);

Router.route("/me/profile").patch(
  makeSureLoggedIn,
  // upload.single('avatar'),
  validateUpdateCurrentUserInput,
  updateCurrentUserProfile
);

Router.route("/me/profile/avatar").patch(
  makeSureLoggedIn,
  upload.single("avatar"),
  updateAvatar
);

Router.route("/:userId").get(makeSureLoggedIn, getUserByUserId);

Router.route("/me/password").patch(
  makeSureLoggedIn,
  validateUpdateUserPasswordInput,
  updateCurrentUserPassword
);

module.exports = Router;
