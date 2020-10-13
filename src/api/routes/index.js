const Router = require("express").Router();

const authRoute = require("./auth.route");

Router.use("/v1/auth", authRoute);

module.exports = Router;
