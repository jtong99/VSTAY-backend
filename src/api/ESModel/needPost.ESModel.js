const httpStatus = require("http-status");
const APIError = require("../utils/APIErr");

const { PostType } = require("../../config/config.enum");

class ESNeedPost {
  constructor(ESclient) {
    this.ESclient = ESclient;
    this.index = "need-posts";
    this.type = "need-post";
  }
  async createOne(postID, postObj) {
    try {
      var clone = Object.assign({}, postObj);
      delete clone._id;
      const result = await this.ESclient.index({
        id: postID.toString(),
        index: "need-posts",
        type: "need-post",
        body: clone,
      });
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

module.exports = ESNeedPost;
