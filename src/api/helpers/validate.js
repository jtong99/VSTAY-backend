const _ = require("lodash");
module.exports.isValidID = function (videoID) {
  const validations = {
    videoID: {
      errorMessage: [
        "Video ID is reuqired",
        "Video ID must be string",
        "Video ID is invalid",
        "Video ID must not contain symbols",
      ],
      doValidate: () => {
        // const videoID = _.get(params, 'videoID', null);
        const withoutSymbols = /[^a-zA-Z\d]/gim;
        const ObjectIDExceptLength = 24;
        if (videoID === null) {
          return -1;
        }
        if (typeof videoID !== "string" && !(videoID instanceof String)) {
          return 1;
        }
        if (videoID.length !== ObjectIDExceptLength) {
          return 2;
        }
        if (withoutSymbols.test(videoID)) {
          return 3;
        }
        return -1;
      },
    },
  };
  const errors = [];
  _.each(validations, (validation) => {
    const error = validation.doValidate();
    if (error !== -1) {
      errors.push(validation.errorMessage[error]);
    }
  });
  if (errors.length > 0) {
    return false;
  }
  return true;
};
