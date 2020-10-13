const User = require("./user.model");
const Token = require("./token.model");
class Model {
  constructor({ db }) {
    this.User = new User(db);
    this.Token = new Token(db);
  }
}

module.exports = Model;
