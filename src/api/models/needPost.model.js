const httpStatus = require("http-status");
const { Models } = require("../../config/vars");
const BaseModel = require("../../used/base.model");
const { toObjectId } = require("../helpers");
const { PostStatus } = require("../../config/config.enum");
const { ObjectId } = require("mongodb");
const APIError = require("../utils/APIErr");

class NeedPost extends BaseModel {
  constructor(db) {
    super();
    this.collectionName = Models.NEED_POST;
    this.collection = db.collection(this.collectionName);
  }

  async insertOne(post) {
    try {
      const result = await this.collection.insertOne(post);
      return result.ops[0];
    } catch (error) {
      throw new APIError({
        message: "Failed on inserting need post",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  deleteById = async (id = "", user = "") => {
    const _id = toObjectId(id);

    const existedPost = await this.collection.find({ _id }).next();
    if (!existedPost) {
      throw new APIError({
        message: `No post found - id: ${_id}`,
        status: httpStatus.NOT_FOUND,
      });
    }

    try {
      // const hook = async (videoId) => {
      //   try {
      //     await this.commentsCollection.deleteMany({ videoID: videoId });
      //     await this.userVideoCollection.deleteMany({ videoId: videoId });
      //     await this.videosCollection.deleteOne({ _id: videoId });
      //     await this.videoQACollection.deleteOne({ videoId: videoId });
      //     await this.userVideoCollection.deleteMany({ videoId: videoId });
      //     await this.featuredVideoCollection.deleteMany({ videoID: videoId });
      //     await this.userVideoListCollection.updateOne(
      //       {},
      //       { $pull: { videoIDs: { videoID: videoId } } },
      //       { multi: true }
      //     );
      //   } catch (error) {
      //     throw new Error(`(deleteById) hook - videoId: ${videoId}`);
      //   }
      // };
      // hook(_id);
      const result = await this.collection.deleteOne({ _id: _id });

      return result.result;
    } catch (error) {
      throw new APIError({
        message: error.message || "Failed on deleting post",
        status: error.status || httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  };

  async getById(_id, projection = {}) {
    try {
      const query = {
        _id: _id,
      };
      const result = await this.collection.findOne(query, {
        projection: projection,
      });
      return result;
    } catch (error) {
      throw new APIError({
        message: "Failed on getting post",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async getByUserId(userID, sort, pagination, projection = {}) {
    try {
      const query = {
        poster: userID,
        status: { $ne: PostStatus.DELETED },
        // status: PostStatus.PENDING, get all of status
      };
      const result = await this.collection
        .find(query, { projection: projection })
        .sort(sort)
        .skip(pagination.pageNumber * pagination.pageSize)
        .limit(pagination.pageSize);

      const count = await result.count();
      const resultArray = await result.toArray();
      const returnObject = {
        total: count ? count : 0,
        resultArray: resultArray ? resultArray : [],
      };
      return returnObject;
    } catch (error) {
      throw new APIError({
        message: "Failed on getting posts",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async getTotalCount(projection = {}) {
    try {
      const getPending = await this.collection.find(
        { status: { $eq: "pending" } },
        { projection: projection }
      );
      const totalPending = await getPending.count();

      const getApproved = await this.collection.find(
        { status: { $eq: "approved" } },
        { projection: projection }
      );
      const totalApproved = await getApproved.count();

      const getRejected = await this.collection.find(
        { status: { $eq: "rejected" } },
        { projection: projection }
      );
      const totalRejected = await getRejected.count();
      const returnObject = {
        totalPending,
        totalApproved,
        totalRejected,
      };
      return returnObject;
    } catch (error) {
      throw new APIError({
        message: "Failed on getting count data",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async getAllNeedPost(pagination, sort, projection = {}) {
    try {
      const result = await this.collection
        .find({}, { projection: projection })
        .sort(sort)
        .skip(pagination.pageNumber * pagination.pageSize)
        .limit(pagination.pageSize);
      const count = await result.count();
      const resultArray = await result.toArray();
      const returnObject = {
        total: count ? count : 0,
        resultArray: resultArray ? resultArray : [],
      };
      return returnObject;
    } catch (error) {
      throw new APIError({
        message: "Failed on getting posts",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async getPostByType(type, pagination, sort, projection = {}) {
    try {
      const result = await this.collection
        .find({ status: { $eq: type } }, { projection: projection })
        .sort(sort)
        .skip(pagination.pageNumber * pagination.pageSize)
        .limit(pagination.pageSize);
      const count = await result.count();
      const resultArray = await result.toArray();

      // console.log(resultArray);
      const returnObject = {
        total: count ? count : 0,
        resultArray: resultArray ? resultArray : [],
      };
      return returnObject;
    } catch (error) {
      throw new APIError({
        message: "Failed on getting posts",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async getAllActiveNeedPost(pagination, sort, projection = {}) {
    try {
      const result = await this.collection
        .find({ status: PostStatus.APPROVED }, { projection: projection })
        .sort(sort)
        .skip(pagination.pageNumber * pagination.pageSize)
        .limit(pagination.pageSize);
      const count = await result.count();
      const resultArray = await result.toArray();
      const returnObject = {
        total: count ? count : 0,
        resultArray: resultArray ? resultArray : [],
      };
      return returnObject;
    } catch (error) {
      throw new APIError({
        message: "Failed on getting posts",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async updateStatistics(_id, updateData) {
    try {
      const query = {
        _id: _id,
      };
      const fitData = {};
      for (const k in updateData) {
        const val = updateData[k];
        const newK = `statistics.${k}`;
        fitData[newK] = val;
      }
      const data = {
        $set: fitData,
      };
      const result = await this.collection.findOneAndUpdate(query, data, {
        returnOriginal: false,
      });
      return result.value;
    } catch (error) {
      throw new APIError({
        message: "Failed on updating need post statistics",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }

  async updateById(id, userId, rawData) {
    try {
      const query = { _id: { $eq: ObjectId(id) } };
      // const query = {
      //   _id: _id,
      //   poster: userId,
      // };
      console.log(rawData);
      const data = {
        $set: rawData,
      };
      const result = await this.collection.findOneAndUpdate(query, data, {
        returnOriginal: false,
      });
      console.log(result);
      return result.value;
    } catch (error) {
      throw new APIError({
        message: "Failed on updating posts",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }
}

module.exports = NeedPost;
