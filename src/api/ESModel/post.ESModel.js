const httpStatus = require("http-status");
const APIError = require("../utils/APIErr");

const { PostType } = require("../../config/config.enum");

class ESPost {
  constructor(ESclient) {
    this.ESclient = ESclient;
    this.index = "posts";
    this.type = "post";
  }
  async createOne(postID, postObj) {
    try {
      var clone = Object.assign({}, postObj);
      delete clone._id;
      const result = await this.ESclient.index({
        id: postID.toString(),
        index: "posts",
        type: "post",
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

module.exports = ESPost;
