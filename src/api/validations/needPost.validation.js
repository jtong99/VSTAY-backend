const { ObjectID } = require("mongodb");
const Model = require("../models");
const httpStatus = require("http-status");
const _ = require("lodash");

module.exports.paramsNeedPostValidation = async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const { NeedPost } = new Model({ db });
    const params = req.params;
    const validations = {
      postID: {
        errorMessage: [
          "Post ID is reuqired",
          "Post ID must be string",
          "Post ID is invalid",
          "Post ID must not contain symbols",
        ],
        doValidate: () => {
          const postID = _.get(params, "postID", null);
          const withoutSymbols = /[^a-zA-Z\d]/gim;
          const ObjectIDExceptLength = 24;
          if (postID === null) {
            return -1;
          }
          if (typeof postID !== "string" && !(postID instanceof String)) {
            return 1;
          }
          if (postID.length !== ObjectIDExceptLength) {
            return 2;
          }
          if (withoutSymbols.test(postID)) {
            return 3;
          }
          return -1;
        },
      },
      reactionType: {
        errorMessage: [
          "Reaction is required",
          'Reaction just allow "like" or "dislike" value',
        ],
        doValidate: () => {
          const reaction = _.get(params, "reactionType", null);
          const REACTIONS = ["like", "dislike"];
          if (reaction === null) {
            return -1;
          }
          if (REACTIONS.indexOf(reaction.toLowerCase()) === -1) {
            return 1;
          }
          return -1;
        },
      },
    };
    const errors = [];
    _.each(validations, (validation) => {
      const error = validation.doValidate();
      if (error !== -1) {
        errors.push(validation.errorMessage[error]);
      }
    });
    if (errors.length > 0) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          code: httpStatus.UNPROCESSABLE_ENTITY,
          message: _.join(errors, ","),
        })
        .end();
    }

    const existedValidations = {
      postID: {
        errorMessage: "post is not found",
        doValidate: async () => {
          const postID = _.get(params, "postID", null);
          if (postID === null) {
            return true;
          }
          const result = await NeedPost.getById(new ObjectID(postID), {
            _id: 1,
          });
          if (!result || result.length <= 0) {
            return false;
          }

          return true;
        },
      },
    };

    const existedErrors = [];
    await Promise.all(
      _.map(existedValidations, async (validation) => {
        const isExisted = await validation.doValidate();
        if (!isExisted) {
          existedErrors.push(validation.errorMessage);
        }
      })
    );

    if (existedErrors.length > 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: _.join(existedErrors, ","),
        })
        .end();
    }

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
