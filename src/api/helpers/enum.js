const enumToArray = function (enumObject) {
  const all = [];
  for (const key in enumObject) {
    all.push(enumObject[key]);
  }
  return all;
};

/**
 * Check if a value in an enum object
 * @param {any} value
 * @param {Enumerator} enumObject
 *
 * @returns {Boolean}
 */
const isInEnum = function (value, enumObject) {
  let flag = false;
  enumToArray(enumObject).forEach((item) => {
    if (item === value) {
      flag = true;
    }
  });

  return flag;
};

module.exports = {
  enumToArray,
  isInEnum,
};
