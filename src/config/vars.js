const path = require("path");
const dotenv = require("dotenv-safe");
const { EnvHostingEnum } = require("./config.enum");

dotenv.config({
  allowEmptyValues: true,
  path: path.join(__dirname, "../../.env"),
  example: path.join(__dirname, "../../.env.example"),
});

const env = process.env.NODE_ENV;
const hostname =
  env === EnvHostingEnum.DEVELOPMENT
    ? process.env.DEV_HOST_NAME
    : process.env.PROD_HOST_NAME;
const port = process.env.PORT;
const db = {
  host: process.env.DB_HOST,
  name: process.env.DB_NAME,
  port: process.env.DB_PORT,
  name: process.env.DB_NAME,
  user: {
    name: process.env.DB_USER_RW_NAME,
    pwd: process.env.DB_USER_RW_PWD,
  },
};

const databaseUri =
  env === EnvHostingEnum.DEVELOPMENT
    ? process.env.DATABASE_URL
    : `mongodb://${db.user.name}:${db.user.pwd}@${db.host}:${db.port}/${db.name}?authSource=admin`;

module.exports = {
  hostname,
  env,
  port,
  database: {
    uri: databaseUri,
    name: db.name,
  },
  ES: {
    uri: process.env.ES_URI,
    host: process.env.ES_HOST,
    port: process.env.ES_PORT,
  },
  secretOrPrivateKey: {
    value: process.env.SECRET_OR_PRIVATE_KEY,
    accessTokenExpiration:
      env === EnvHostingEnum.DEVELOPMENT
        ? process.env.ACCESS_TOKEN_EXPIRATION_IN_MINUTE * 10000
        : process.env.ACCESS_TOKEN_EXPIRATION_IN_MINUTE,
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION_IN_HOUR,
  },
  service: {
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
    },
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
  POST: "post",
  NEED_POST: "needPost",
};

module.exports.migration = {
  urlMongo:
    env === EnvHostingEnum.DEVELOPMENT
      ? "mongodb://localhost:27017/v-stay-db?readPreference=primary&authSource=admin&appname=MongoDB%20Compass&ssl=false"
      : "mongodb://duc:minhduc1909@52.167.219.69:9000/v-stay-db?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false",
  urlElastic:
    env === EnvHostingEnum.DEVELOPMENT
      ? "http://localhost:9200"
      : "http://elasticsearch:9200",
};

module.exports.services = {
  sendgrid: {
    key: process.env.SENDGRID_API_KEY,
  },
};
