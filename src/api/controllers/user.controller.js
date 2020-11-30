const httpStatus = require("http-status");
const _ = require("lodash");
const path = require("path");

const Model = require("../models");

const { hostname } = require("../../config/vars");

const { extractJwt } = require("../../config/passport");

const { UserRolesEnum } = require("../../config/config.enum");

const { moveFile, createFolderIfNotExists } = require("../helpers/fileSystem");

module.exports.getCurrentUser = (req, res, next) => {
  const user = req.user;

  delete user.password;
  //   user.email = decrypt(user.email);
  try {
    return res
      .status(httpStatus.OK)
      .json({
        code: httpStatus.OK,
        message: "OK",
        user,
      })
      .end();
  } catch (error) {
    next(error);
  }
};

module.exports.getUserByUserId = async (req, res, next) => {
  const { db } = req.app.locals;
  const { userId } = req.params;
  const { User } = new Model({ db });

  try {
    const user = await User.getUserById(userId);
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "No user found",
        })
        .end();
    }

    const response = {
      code: httpStatus.OK,
      message: "Successfully get user data",
      user: User.transform(user),
    };

    return res.status(response.code).json(response).end();
  } catch (error) {
    next(error);
  }
};

module.exports.updateCurrentUserProfile = async (req, res, next) => {
  const { db } = req.app.locals;
  const { User } = new Model({ db });
  const user = req.user;

  const facebook = _.get(req.body, "facebook", "");
  const linkedin = _.get(req.body, "linkedin", "");
  const youtube = _.get(req.body, "youtube", "");
  const instagram = _.get(req.body, "instagram", "");
  const about = _.get(req.body, "about", "");
  const headline = _.get(req.body, "headline", "");
  const language = _.get(req.body, "language", "");

  const updateData = {
    social: {
      facebook,
      linkedin,
      youtube,
      instagram,
    },
    about,
    headline,
    language,
  };

  try {
    // if (req.file && req.file.filename) {
    // 	updateData.avatar =
    // 		`${hostname}/uploads/avatars/` + req.file.filename;

    // 	const imagesUploadingFolder = path.join(
    // 		__dirname,
    // 		'../uploads/avatars',
    // 	);
    // 	const userAvatarFolderPath = path.join(
    // 		imagesUploadingFolder,
    // 		req.file.filename,
    // 	);

    // 	createFolderIfNotExists(imagesUploadingFolder);
    // 	// move uploaded images in /uploads folder to /uploads/images folder
    // 	await moveFile(req.file.path, userAvatarFolderPath);
    // }

    const updatedUser = await User.updateUserById(user._id, updateData);

    const response = {
      code: httpStatus.OK,
      message: "Updated user data",
      user: User.transform(updatedUser),
    };

    return res.status(response.code).json(response).end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.updateAvatar = async (req, res, next) => {
  const { db } = req.app.locals;
  const { User } = new Model({ db });
  const user = req.user;

  const updateData = {};

  try {
    if (req.file && req.file.filename) {
      updateData.avatar = `${hostname}/uploads/avatars/` + req.file.filename;

      const imagesUploadingFolder = path.join(__dirname, "../uploads/avatars");
      const userAvatarFolderPath = path.join(
        imagesUploadingFolder,
        req.file.filename
      );

      createFolderIfNotExists(imagesUploadingFolder);
      // move uploaded images in /uploads folder to /uploads/images folder
      await moveFile(req.file.path, userAvatarFolderPath);
    }

    const updatedUser = await User.updateUserById(user._id, updateData);

    const response = {
      code: httpStatus.OK,
      message: "Updated user data",
      user: User.transform(updatedUser),
    };

    return res.status(response.code).json(response).end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.updateCurrentUserPassword = async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const { User } = new Model({ db });
    const user = req.user;

    const { currentPassword, newPassword, confirmPassword } = req.body;

    const isPasswordMatched = await User.comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordMatched) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({
          code: httpStatus.BAD_REQUEST,
          message: "Current password does not match with the account",
        })
        .end();
    }

    if (confirmPassword.trim() !== newPassword.trim()) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({
          code: httpStatus.BAD_REQUEST,
          message: "Confirm password and New password fields must match",
          errors: [
            {
              field: "confirmPassword",
              location: "body",
              message: "confirmPassword must match newPassword field",
            },
          ],
        })
        .end();
    }

    const updatedUser = await User.updateUserPasswordById(
      user._id,
      newPassword
    );
    console.log(updatedUser);
    if (!updatedUser) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: "Failed to update user password",
        })
        .end();
    }

    return res
      .status(httpStatus.OK)
      .json({
        code: httpStatus.OK,
        message: "User password is updated",
      })
      .end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
