const httpStatus = require("http-status");
const _ = require("lodash");
const {
  PostType,
  RoomFurnishing,
  RoomToilet,
  RoomFeatures,
  Bills,
  CustomerPreference,
  TypeOfPost,
} = require("../../config/config.enum");
const { ObjectID } = require("mongodb");
const Model = require("../models");

module.exports.postShareInsertValidation = async (req, res, next) => {
  try {
    const postObject = req.body;
    const validations = {
      type_of_post: {
        errorMessage: [
          "Type of post is required",
          "Type of post must be string",
          "Type of post is invalid",
        ],
        validate: () => {
          const typeOfPost = _.get(postObject, "type_of_post", null);
          if (typeOfPost === null) {
            return 0;
          }
          if (
            typeof typeOfPost !== "string" &&
            !(typeOfPost instanceof String)
          ) {
            return 1;
          }
          if (!Object.values(TypeOfPost).includes(typeOfPost)) {
            return 2;
          }
          return -1;
        },
      },
      type: {
        errorMessage: [
          "Type is required",
          "Type must be string",
          "Type is invalid",
        ],
        validate: () => {
          const type = _.get(postObject, "type", null);
          if (type === null) {
            return 0;
          }
          if (typeof type !== "string" && !(type instanceof String)) {
            return 1;
          }
          if (!Object.values(PostType).includes(type)) {
            return 2;
          }
          return -1;
        },
      },
      title: {
        errorMessage: [
          "Title is required",
          "Title must be string",
          "Title length is invalid",
          "Title must not contain symbols",
        ],
        validate: () => {
          const title = _.get(postObject, "title", null);
          const titleMaxLength = 200;
          if (title === null) {
            return 0;
          }
          if (typeof title !== "string" && !(title instanceof String)) {
            return 1;
          }
          if (title.length <= 0 || title.length >= titleMaxLength) {
            return 2;
          }
          return -1;
        },
      },
      description: {
        errorMessage: [
          "Description is required",
          "Description must be string",
          "Description is invalid",
        ],
        validate: () => {
          const description = _.get(postObject, "description", null);
          const descriptionMaxLength = 500;
          if (description === null) {
            return 0;
          }
          if (
            typeof description !== "string" &&
            !(description instanceof String)
          ) {
            return 1;
          }
          if (
            description.length <= 0 ||
            description.length >= descriptionMaxLength
          ) {
            return 2;
          }
          return -1;
        },
      },
      price: {
        errorMessage: [
          "Price is required",
          "Price must be number",
          "Price is invalid",
        ],
        validate: () => {
          const price = _.get(postObject, "price", null);

          if (price === null) {
            return 0;
          }
          if (typeof price !== "number" && !(price instanceof Int)) {
            return 1;
          }
          return -1;
        },
      },
      address: {
        errorMessage: [
          "Address is required",
          "Address must be object",
          "Address is invalid",
        ],
        validate: () => {
          const address = _.get(postObject, "address", null);

          if (address === null) {
            return 0;
          }
          if (typeof address !== "object" && !(address instanceof Object)) {
            return 1;
          }
          if (
            !address.name ||
            !address.geocode ||
            !address.geocode.latitude ||
            !address.geocode.longitude ||
            typeof address.geocode.latitude !== "number" ||
            typeof address.geocode.longitude !== "number"
          ) {
            return 2;
          }
          return -1;
        },
      },
      detail: {
        errorMessage: [
          "Detail is required",
          "Detail must be object",
          "Detail of parking information is required",
          "Detail of parking information is invalid",
          "Detail of internet information is required",
          "Detail of internet information is invalid",
          "Detail of total bathrooms is required",
          "Detail of total bedrooms is required",
          "Detail of room furnishings is required",
          "Detail of room furnishings is invalid",
          "Detail of room toilets is required",
          "Detail of room toilets is invalid",
          "Detail of max people lives with is required",
          "Detail of max people lives with is invalid",
          "Detail of bills is required",
          "Detail of bills is invalid",
          "Detail of except is invalid",
          "Detail of except references is invalid",
        ],
        validate: () => {
          const detail = _.get(postObject, "detail", null);
          const type = _.get(postObject, "type", null);
          if (detail === null) {
            return 0;
          }
          if (typeof detail !== "object" && !(detail instanceof Object)) {
            return 1;
          }
          if (!detail.parking) {
            return 2;
          }
          if (
            typeof detail.parking !== "string" &&
            !(detail.parking instanceof String)
          ) {
            return 3;
          }
          if (!detail.internet) {
            return 4;
          }
          if (
            typeof detail.internet !== "string" &&
            !(detail.internet instanceof String)
          ) {
            return 5;
          }
          if (type === PostType.R_HOUSE || type === PostType.N_HOUSE) {
            if (!detail.total_bathrooms) {
              return 6;
            }
            if (!detail.total_bedrooms) {
              return 7;
            }
          }
          if (!detail.furnishing) {
            return 8;
          }
          if (!Object.values(RoomFurnishing).includes(detail.furnishing)) {
            return 9;
          }
          if (!detail.toilets) {
            return 10;
          }
          if (!Object.values(RoomToilet).includes(detail.toilets)) {
            return 11;
          }
          if (!detail.max_people_live_with) {
            return 12;
          }
          if (
            typeof detail.max_people_live_with !== "number" &&
            !(detail.max_people_live_with instanceof Int)
          ) {
            return 13;
          }
          if (!detail.bills) {
            return 14;
          }
          if (!Object.values(Bills).includes(detail.bills)) {
            return 15;
          }
          if (typeof detail.except !== "string") {
            return 16;
          }
          if (detail.except) {
            if (!Object.values(CustomerPreference).includes(detail.except)) {
              return 17;
            }
          }
          return -1;
        },
      },
      features: {
        errorMessage: ["Features must be array", "Features is invalid"],
        validate: () => {
          const features = _.get(postObject, "features", null);

          if (typeof features !== "array" && !(features instanceof Array)) {
            return 0;
          }
          for (let i = 0; i < features.length; i++) {
            if (!Object.values(RoomFeatures).includes(features[i])) {
              return 1;
            }
          }
          return -1;
        },
      },
    };
    const errors = {};
    _.each(validations, (validation, field) => {
      const isValid = validation.validate();
      if (isValid !== -1) {
        errors[field] = validation.errorMessage[isValid];
      }
    });

    if (!_.isEmpty(errors)) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          code: httpStatus.UNPROCESSABLE_ENTITY,
          message: "Unprocessable Entity",
          errors: errors,
        })
        .end();
    }
    return next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.paramsSharePostValidation = async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const { Post } = new Model({ db });
    const params = req.params;
    console.log(params);
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
          const result = await Post.getById(new ObjectID(postID), {
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
