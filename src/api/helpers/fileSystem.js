const Promise = require("bluebird");
const fs = require("fs");
const httpStatus = require("http-status");
const path = require("path");
const sharp = require("sharp");
const shell = require("shelljs");

const APIError = require("../utils/APIErr");

const copyFileAsync = Promise.promisify(fs.copyFile);
const moveFileAsync = Promise.promisify(fs.rename);
const unlinkAsync = Promise.promisify(fs.unlink);
const readdirAsync = Promise.promisify(fs.readdir);

module.exports.copyFile = async (source, destination) => {
  try {
    await copyFileAsync(source, destination);

    console.log(`${source} is copied to ${destination} successfully`);
  } catch (error) {
    throw new APIError({
      message: "Error functional execution",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      stack: error.stack,
      isPublic: false,
      errors: [
        {
          field: "",
          location: "",
          message: "",
        },
      ],
    });
  }
};

module.exports.moveFile = async (source, destination) => {
  try {
    await moveFileAsync(source, destination);

    console.log(`${source} is moved to ${destination} succesfully`);
  } catch (error) {
    throw new APIError({
      message: "Error functional execution",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      stack: error.stack,
      isPublic: false,
      errors: [
        {
          field: "",
          location: "",
          message: "",
        },
      ],
    });
  }
};

const removeFile = async (source) => {
  try {
    // Assuming that 'source/file.txt' is a regular file.
    await unlinkAsync(source);

    console.log(`${source} is removed succesfully`);
  } catch (error) {
    throw new APIError({
      message: "Error removing file",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      stack: error.stack,
      isPublic: false,
      errors: [
        {
          field: "",
          location: "",
          message: "",
        },
      ],
    });
  }
};
module.exports.removeFile = removeFile;

module.exports.createFolderIfNotExists = (source) => {
  try {
    shell.mkdir("-p", source);
  } catch (error) {
    throw new APIError({
      message: "Error creating new folder",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      stack: error.stack,
    });
  }
};
