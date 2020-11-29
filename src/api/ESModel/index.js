const ShareESPost = require("./sharePost.ESModel");
const NeedESPost = require("./needPost.ESModel");

class ESModel {
  constructor({ ESClient }) {
    this.ShareESPost = new ShareESPost(ESClient);
    this.NeedESPost = new NeedESPost(ESClient);
  }
}
module.exports = ESModel;
