const User = require("./user.model");
const Token = require("./token.model");
const Post = require("./post.model");
const NeedPost = require("./needPost.model");
const View = require("./view.model");
class Model {
  constructor({ db }) {
    this.User = new User(db);
    this.Token = new Token(db);
    this.Post = new Post(db);
    this.NeedPost = new NeedPost(db);
    this.view = new View(db);
  }
}

module.exports = Model;
