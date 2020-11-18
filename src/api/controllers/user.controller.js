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
