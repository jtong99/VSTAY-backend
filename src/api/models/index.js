const User = require("./user.model");
const Token = require("./token.model");
const Post = require("./post.model");
class Model {
  constructor({ db }) {
    this.User = new User(db);
    this.Token = new Token(db);
    this.Post = new Post(db);
  }
}

module.exports = Model;
