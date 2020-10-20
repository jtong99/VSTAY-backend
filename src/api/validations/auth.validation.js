const httpStatus = require("http-status");
const validator = require("validator");
const _ = require("lodash");

const APIError = require("../utils/APIErr");

const {
  includeSpecialChar,
  includeLowerChar,
  includeUpperChar,
  includeNumberChar,
} = require("./base.validation");

const { enumToArray, isInEnum } = require("../helpers/enum");

const Model = require("../models");

const validateSignupInput = (req, res, next) => {
  const errors = [];

  const password = _.get(req.body, "password", "").trim();
  const confirmPassword = _.get(req.body, "confirmPassword", "").trim();

  /**
   * Check name field validation
   * @param name String
   * @case Cannot be empty
   * @case Length is between 2 - 20 characters
   * @case Must not contain symbol character
   */
  const name = _.get(req.body, "name", "").trim();
  if (validator.isEmpty(name)) {
    errors.push({
      field: "name",
      location: "body",
      message: "name field cannot be empty",
    });
  } else {
    if (
      !validator.isLength(name, {
        min: 2,
        max: 20,
      })
    ) {
      errors.push({
        field: "name",
        location: "body",
        message: "name field must be between 2 - 20 characters",
      });
    }

    const withSymbolPattern = /[^a-zA-Z\d\s:]/gm;
    if (validator.matches(name, withSymbolPattern)) {
      errors.push({
        field: "name",
        location: "body",
        message: "names field must not contain symbol character",
      });
    }

    const bannedName = ["vstay"];
    if (bannedName.includes(name.toLowerCase())) {
      errors.push({
        field: "name",
        location: "body",
        message: "name field cannot contain vstay-like meaning",
      });
    }
  }

  /**
   * Check email field validation
   * @param email String
   * @case Cannot be empty
   * @case Valid email format
   */
  const email = _.get(req.body, "email", "").trim();
  if (validator.isEmpty(email)) {
    errors.push({
      field: "email",
      location: "body",
      message: "email field cannot be empty",
    });
  } else {
    if (!validator.isEmail(email)) {
      errors.push({
        field: "email",
        location: "body",
        message: "invalid email format",
      });
    }
  }

  /**
   * Check password field validation
   * @param password String
   * @case Cannot be empty
   * @case Length is between 5 - 25 characters
   * @case Must contain upper characters
   * @case Must contain lower characters
   * @case Must contain number characters
   * @case Must not contain special characters
   */
  if (validator.isEmpty(password)) {
    errors.push({
      field: "password",
      location: "body",
      message: "password field cannot be empty",
    });
  } else {
    if (
      !validator.isLength(password, {
        min: 5,
        max: 25,
      })
    ) {
      errors.push({
        field: "password",
        location: "body",
        message: "password field must be between 5 - 25 characters",
      });
    }
    if (!includeSpecialChar(password)) {
      errors.push({
        field: "password",
        location: "body",
        message: "password field must contain at least 1 symbol character",
      });
    }

    if (!includeUpperChar(password)) {
      errors.push({
        field: "password",
        location: "body",
        message: "password field must contain upper characters",
      });
    }

    if (!includeLowerChar(password)) {
      errors.push({
        field: "password",
        location: "body",
        message: "password field must contain lower characters",
      });
    }

    if (!includeNumberChar(password)) {
      errors.push({
        field: "password",
        location: "body",
        message: "password field must contain number",
      });
    }
  }

  /**
   * Check confirmPassword field validation
   * @param confirmPassword String
   * @case Cannot be empty
   */
  if (validator.isEmpty(confirmPassword)) {
    errors.push({
      field: "confirmPassword",
      location: "body",
      message: "confirm password field cannot be empty",
    });
  } else {
    if (!validator.equals(confirmPassword, password)) {
      errors.push({
        field: "confirmPassword",
        location: "body",
        message: "confirm password must match password field",
      });
    }
  }

  if (errors.length) {
    return res
      .status(httpStatus.UNPROCESSABLE_ENTITY)
      .json({
        code: httpStatus.UNPROCESSABLE_ENTITY,
        message: "Bad data validation",
        errors,
      })
      .end();
  }

  return next();
};

const validateSigninInput = (req, res, next) => {
  const errors = [];

  const email = _.get(req.body, "email", "");
  const password = _.get(req.body, "password", "");
  const firebaseToken = _.get(req.body, "firebaseToken", "");

  try {
    /**
     * Check email field validation
     * @param email String
     * @case Cannot be empty
     * @case Valid email format
     */
    if (validator.isEmpty(email)) {
      errors.push({
        field: "email",
        location: "body",
        message: "email field cannot be empty",
      });
    } else {
      if (!validator.isEmail(email)) {
        errors.push({
          field: "email",
          location: "body",
          message: "invalid email format",
        });
      }
    }

    /**
     * Check password field validation
     * @param password String
     * @case Cannot be empty
     */
    if (!firebaseToken && validator.isEmpty(password)) {
      errors.push({
        field: "password",
        location: "body",
        message: "password field cannot be empty",
      });
    }

    if (errors.length) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          code: httpStatus.UNPROCESSABLE_ENTITY,
          message: "Bad data validation",
          errors,
        })
        .end();
    }

    next();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new APIError({
        message: "Missing request parameters",
        status: httpStatus.BAD_REQUEST,
      });
    }
    console.log(error);
    next(error);
  }
};

const checkUserEmail = async (req, res, next) => {
  const { db } = req.app.locals;
  const { User } = new Model({ db });

  const email = _.get(req.body, "email", "");

  try {
    const user = await User.getUserByEmail(email);
    if (!user) {
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
    console.log(error);
    return next(error);
  }
};

module.exports = {
  validateSignupInput,
  validateSigninInput,
  checkUserEmail,
};
