const httpStatus = require("http-status");
const _ = require("lodash");
const path = require("path");

const Model = require("../models");

const { hostname } = require("../../config/vars");

const { extractJwt } = require("../../config/passport");

const { UserRolesEnum } = require("../../config/config.enum");

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
