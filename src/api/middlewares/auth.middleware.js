const passport = require("passport");
const httpStatus = require("http-status");
const _ = require("lodash");
const Model = require("../models");

const makeSureLoggedIn = (req, res, next) => {
  passport.authenticate("jwt", (error, user, info) => {
    if (error) {
      console.log(error);
      return next(error);
    }

    if (!user) {
      const response = {
        code: httpStatus.UNAUTHORIZED,
        message: "Unauthorized",
      };
      return res.status(response.code).json(response).end();
    }
    // console.log(user);
    // add user to payload data req
    req.logIn(user, { session: false }, (errorAssignAuth) => {
      if (errorAssignAuth) {
        return next(errorAssignAuth);
      }
    });

    // const status = user.status;
    // if (status === UserStatusEnum.BLOCKED) {
    //   const response = {
    //     code: httpStatus.FORBIDDEN,
    //     message:
    //       "You are blocked, checkout our policy or contact our customer service to resolve this problem",
    //   };

    //   return res.status(response.code).json(response).end();
    // }
    return next();
  })(req, res, next);
};

const checkUserEmail = async (req, res, next) => {
  const { db } = req.app.locals;
  const { User } = new Model({ db });

  const email = _.get(req.body, "email", "");

  try {
    const user = await User.getUserByEmail(email);
    if (!user) {
      if (res.limitRequest.isBanned === true) {
        return res
          .status(res.limitRequest.response.code)
          .json(res.limitRequest.response)
          .end();
      }

      const response = {
        code: httpStatus.NOT_FOUND,
        message: "Wrong account or password",
      };

      return res.status(response.code).json(response).end();
    }

    req.middleware = {};
    req.middleware.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

const checkUserPassword = async (req, res, next) => {
  const { db } = req.app.locals;
  const { User } = new Model({ db });
  const user = req.middleware.user;
  const password = _.get(req.body, "password", "");

  try {
    const isPasswordMatched = await User.comparePassword(
      password,
      user.password
    );
    if (!isPasswordMatched) {
      const response = {
        code: httpStatus.BAD_REQUEST,
        message: "Wrong account or password",
      };
      return res.status(response.code).json(response).end();
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

const checkCredentials = async (req, res, next) => {
  const provider = _.get(req.body, "provider", "");

  if (!provider) {
    return checkUserPassword(req, res, next);
  }
};

module.exports = {
  makeSureLoggedIn,
  checkUserPassword,
  checkUserEmail,
};
