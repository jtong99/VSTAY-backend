const httpStatus = require("http-status");
const Model = require("../models");
const { ObjectID } = require("mongodb");
const _ = require("lodash");
const APIError = require("../utils/APIErr");
const { TypeOfPost } = require("../../config/config.enum");

module.exports.pushViewToPost = async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const { view, NeedPost, Post } = new Model({ db });
    const type = _.get(req.query, "type", "");
    const { postID } = req.params;

    const userID = req.user._id;

    const viewObj = {
      postID: new ObjectID(postID),
      postType: type,
      views: [
        {
          userID: userID,
          createdAt: new Date(),
        },
      ],
    };

    if (!type) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "You have to add type in req query",
        })
        .end();
    }

    if (!Object.values(TypeOfPost).includes(type)) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "type is invalid",
        })
        .end();
    }

    const isDocExisted = await view.isViewDocExisted(viewObj.postID);
    if (!isDocExisted) {
      console.log("no exist");
      const result = await view.createOne(viewObj);
      if (type === TypeOfPost.NEED) {
        const updateViewStatisticNeedPost = await NeedPost.updateStatistics(
          viewObj.postID,
          {
            viewCount: result.views.length,
          }
        );
      } else {
        const updateViewStatisticSharePost = await Post.updateStatistics(
          viewObj.postID,
          {
            viewCount: result.views.length,
          }
        );
      }
      return res
        .status(httpStatus.CREATED)
        .json({
          code: httpStatus.CREATED,
          message: "Push view to Post successfully",
          resutl: result,
        })
        .end();
    }

    const result = await view.pushView(viewObj.postID, viewObj.views[0]);
    console.log("existed");
    if (type === TypeOfPost.NEED) {
      const updateViewStatisticNeedPost = await NeedPost.updateStatistics(
        viewObj.postID,
        {
          viewCount: result.views.length + 1,
        }
      );
    } else {
      const updateViewStatisticSharePost = await Post.updateStatistics(
        viewObj.postID,
        {
          viewCount: result.views.length + 1,
        }
      );
    }
    return res
      .status(httpStatus.OK)
      .json({
        code: httpStatus.OK,
        message: "Push view to Post successfully",
        result: result,
      })
      .end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.getViewByDate = async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const { view, Post } = new Model({ db });

    const { from, to } = req.query;

    const date = {
      from: new Date(parseInt(from) * 1000),
      to: new Date(parseInt(to) * 1000),
    };

    const userID = req.user._id;

    const { total, resultArray } = await Post.getByUserId(
      userID,
      {},
      {
        pageSize: 0,
        pageNumber: 0,
      },
      { _id: 1 }
    );
    if (resultArray.length <= 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "Posts are not found",
        })
        .end();
    }
    for (const i in resultArray) {
      resultArray[i] = new ObjectID(resultArray[i]._id);
    }

    const result = await view.getViewsOfAllVideosOfUserByTimes(
      resultArray,
      date.from,
      date.to
    );
    if (!result || result.length <= 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "Statistics for views is not found",
          filter: date,
        })
        .end();
    }

    return res
      .status(httpStatus.OK)
      .json({
        code: httpStatus.OK,
        message: "get view statistics successfully",
        result: result,
      })
      .end();
  } catch (error) {
    next(error);
  }
};

module.exports.getViewByDateOfPost = async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const { view } = new Model({ db });

    const { from, to } = req.query;

    const date = {
      from: new Date(parseInt(from) * 1000),
      to: new Date(parseInt(to) * 1000),
    };

    const postID = new ObjectID(req.params.postID);

    const result = await view.getByDatesOfPost(postID, date.from, date.to);
    if (!result || result.length <= 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "Statistics for views is not found",
          filter: date,
        })
        .end();
    }

    return res
      .status(httpStatus.OK)
      .json({
        code: httpStatus.OK,
        message: "get view statistics successfully",
        result: result,
      })
      .end();
  } catch (error) {
    next(error);
  }
};
