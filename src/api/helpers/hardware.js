const _ = require("lodash");
const useragent = require("useragent");

module.exports.getUserAgent = (req) => {
  const requestAgent = useragent.parse(req.headers["user-agent"]);
  const userAgent = {
    browser: _.get(requestAgent, "family", "Other"),
    os: _.get(requestAgent.os, "family", "Other"),
    device: _.get(requestAgent.device, "family", "Other"),
    ip: req.connection.remoteAddress,
  };

  return userAgent;
};
