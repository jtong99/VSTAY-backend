const { ObjectId } = require("mongodb");

module.exports.isValidId = function (id) {
  if (ObjectId.isValid(id)) {
    return true;
  }

  return false;
};
