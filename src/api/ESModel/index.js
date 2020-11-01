const ESPost = require("./post.ESModel");

class ESModel {
  constructor({ ESClient }) {
    this.ESPost = new ESPost(ESClient);
  }
}
module.exports = ESModel;
