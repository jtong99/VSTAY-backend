const Router = require("express").Router();

const authRoute = require("./auth.route");
const postRoute = require("./post.route");
const userRoute = require("./user.route");
const needPostRouter = require("./needPost.route");
const viewRouter = require("./view.route");

Router.use("/v1/auth", authRoute);
Router.use("/v1/api/post", postRoute);
Router.use("/v1/api/user", userRoute);
Router.use("/v1/api/need-post", needPostRouter);
Router.use("/v1/api/view", viewRouter);

module.exports = Router;
