const httpStatus = require("http-status");

const APIError = require("../utils/APIErr");

class Reactions {
  constructor(db) {
    this.collection = db.collection("reactions");
  }

  async insertOne(data) {
    try {
      const result = await this.collection.insertOne(data);
      return result.ops[0];
    } catch (error) {
      throw new APIError({
        message: "Failed in inserting",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }
  async getOneByPostID(postID) {
    try {
      const result = await this.collection.findOne({ postID: postID });
      return result;
    } catch (error) {
      throw new APIError({
        message: "falied on getting reaction",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }
  async push(postID, userReaction, reactionObj) {
    try {
      const result = await this.collection.findOneAndUpdate(
        {
          postID: postID,
        },
        {
          $push: {
            [userReaction]: reactionObj,
          },
        },
        {
          returnOriginal: false,
        }
      );

      return result ? result.value : null;
    } catch (error) {
      throw new APIError({
        message: "failed on pushing new reaction",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async pull(postID, userID) {
    try {
      const result = await this.collection.findOneAndUpdate(
        {
          postID: postID,
        },
        {
          $pull: {
            like: {
              userID: userID,
            },
            dislike: {
              userID: userID,
            },
          },
        },
        {
          returnOriginal: false,
        }
      );
      return result;
    } catch (error) {
      throw new APIError({
        message: "falied on pulling creaction",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }
}

module.exports = Reactions;
