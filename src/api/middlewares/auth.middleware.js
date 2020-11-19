const passport = require("passport");
const httpStatus = require("http-status");
const _ = require("lodash");

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
    console.log(user);
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

module.exports = {
  makeSureLoggedIn,
};
