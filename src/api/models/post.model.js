const { classes, _CLASS } = require("http-status");
const { Models } = require("../../config/vars");
const BaseModel = require("../../used/base.model");

class Post extends BaseModel {
  constructor(db) {
    super();
    this.collectionName = Models.POST;
    this.collection = db.collection(this.collectionName);
  }
}

module.exports = Post;
