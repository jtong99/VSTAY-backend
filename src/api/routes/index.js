const Router = require("express").Router();

const authRoute = require("./auth.route");
const postRoute = require("./post.route");

Router.use("/v1/auth", authRoute);
Router.use("/v1/api/post", postRoute);

module.exports = Router;
