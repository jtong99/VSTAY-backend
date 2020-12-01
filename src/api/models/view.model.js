/**
 * @modelName views
 * @modelField {objectID} _id view's unique id
 * @modelField {String} postID Post unique ID
 * @modelField {Object[]} views List of view object
 * @modelField {String} views.userID user unique ID
 * @modelField {Date} views.createdAt
 * @modelField {Date} createdAt
 * @modelField {Date} updatedAt
 */

const httpStatus = require("http-status");

const APIError = require("../utils/APIErr");
const { NOT_EXTENDED } = require("http-status");

class View {
  constructor(db) {
    this.collection = db.collection("views");
  }

  /**
   *==========================================================
   *=                Creation functions                      =
   *=        Put all the creation functions below            =
   *==========================================================
   */

  async createOne(viewObj) {
    try {
      const result = await this.collection.insertOne(viewObj);
      return result ? result.ops[0] : null;
    } catch (error) {
      throw new APIError({
        message: "Failed on creating view document",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  /**
   *===================================================
   *=                Query functions                  =
   *=        Put all the query functions below        =
   *===================================================
   */

  async isViewDocExisted(postID) {
    try {
      const result = await this.collection
        .find({
          postID: postID,
        })
        .count();

      return result > 0 ? true : false;
    } catch (error) {
      throw new APIError({
        message: "Failed on checking existed document",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async getViewCountByPostID(postID) {
    try {
      const result = await this.collection
        .aggregate([
          {
            $match: {
              postID: postID,
            },
          },
          {
            $project: {
              postID: 1,
              viewCount: {
                $size: "$views",
              },
            },
          },
        ])
        .toArray();
      return result && result.length > 0
        ? result[0]
        : {
            postID: postID,
            viewCount: 0,
          };
    } catch (error) {
      throw new APIError({
        message: "Failed on getting view count",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async getByDatesOfPost(postID, from, to) {
    try {
      const result = await this.collection
        .aggregate([
          {
            $match: {
              postID: postID,
            },
          },
          {
            $unwind: {
              path: "$views",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              "views.createdAt": {
                $gte: from,
                $lt: to,
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$views.createdAt",
                },
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ])
        .toArray();
      return result ? result : [];
    } catch (error) {
      throw new APIError({
        message: "Failed on getting views document",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async getViewsOfAllVideosOfUserByTimes(videoIDs, from, to) {
    try {
      const result = await this.collection
        .aggregate([
          {
            $match: {
              postID: {
                $in: videoIDs,
              },
            },
          },
          {
            $unwind: "$views",
          },
          {
            $match: {
              "views.createdAt": {
                $gte: from,
                $lt: to,
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$views.createdAt",
                },
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ])
        .toArray();
      return result;
    } catch (error) {
      throw new APIError({
        message: "Failed on getting views document",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async getViewsCountOfListOfVideosOfUserByTimes(videoIDs, from, to) {
    try {
      const result = await this.collection
        .aggregate([
          {
            $match: {
              postID: {
                $in: videoIDs,
              },
            },
          },
          {
            $unwind: "$views",
          },
          {
            $match: {
              "views.createdAt": {
                $gte: from,
                $lt: to,
              },
            },
          },
          {
            $count: "viewsCount",
          },
        ])
        .toArray();
      return result && result.length > 0 ? result[0].viewsCount : 0;
    } catch (error) {
      throw new APIError({
        message: "Failed on getting views document",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  /**
   *============================================================
   *=                Modification functions                    =
   *=        Put all the modification functions below          =
   *============================================================
   */

  async pushView(postID, viewObj) {
    try {
      const result = await this.collection.findOneAndUpdate(
        {
          postID: postID,
        },
        {
          $push: {
            views: viewObj,
          },
        }
      );
      return result ? result.value : null;
    } catch (error) {
      throw new APIError({
        message: "Failed on pushing view to document",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }
}

module.exports = View;
