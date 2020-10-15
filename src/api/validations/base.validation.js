module.exports.includeSpecialChar = (string) => {
  const specialCharPattern = new RegExp(/.*[°"@§\[\]{}=\\?´`'<>|,;:+_-]+.*/);

  return specialCharPattern.test(string);
};

module.exports.includeUpperChar = (string) => {
  const upperCharPattern = new RegExp(/.*[A-Z]+.*/);

  return upperCharPattern.test(string);
};

module.exports.includeLowerChar = (string) => {
  const lowerCharPattern = new RegExp(/.*[a-z]+.*/);

  return lowerCharPattern.test(string);
};

module.exports.includeNumberChar = (string) => {
  const numberCharPattern = new RegExp(/.*[0-9]+.*/);

  return numberCharPattern.test(string);
};

module.exports.notEditable = (field) => {
  return {
    field: field,
    location: "body",
    message: `${field} field is not editable`,
  };
};
