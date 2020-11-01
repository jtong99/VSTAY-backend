const { classes, _CLASS } = require("http-status");
const { Models } = require("../../config/vars");
const BaseModel = require("../../used/base.model");
const { toObjectId } = require("../helpers");

class Post extends BaseModel {
  constructor(db) {
    super();
    this.collectionName = Models.POST;
    this.collection = db.collection(this.collectionName);
  }

  async insertOne(post) {
    try {
      const result = await this.collection.insertOne(post);
      return result.ops[0];
    } catch (error) {
      throw new APIError({
        message: "Failed on inserting post",
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
}

module.exports = Post;
