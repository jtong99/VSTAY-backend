const path = require("path");
const dotenv = require("dotenv-safe");
const { EnvHostingEnum } = require("./config.enum");

dotenv.config({
  allowEmptyValues: true,
  path: path.join(__dirname, "../../.env"),
  example: path.join(__dirname, "../../.env.example"),
});
const env = process.env.NODE_ENV;
const port = process.env.PORT;
const db = {
  name: process.env.DB_NAME,
};

const databaseUri = process.env.DATABASE_URL;
module.exports = {
  env,
  port,
  database: {
    uri: databaseUri,
    name: db.name,
  },
  secretOrPrivateKey: {
    value: process.env.SECRET_OR_PRIVATE_KEY,
    accessTokenExpiration:
      env === EnvHostingEnum.DEVELOPMENT
        ? process.env.ACCESS_TOKEN_EXPIRATION_IN_MINUTE * 10000
        : process.env.ACCESS_TOKEN_EXPIRATION_IN_MINUTE,
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION_IN_HOUR,
  },
};

module.exports.domain = {
  API:
    env === EnvHostingEnum.DEVELOPMENT
      ? process.env.API_DOMAIN_DEV
      : process.env.API_DOMAIN_PROD,
};

module.exports.Models = {
  USER: "user",
  REFRESH_TOKEN: "refreshToken",
};

module.exports.services = {
  sendgrid: {
    key: process.env.SENDGRID_API_KEY,
  },
};