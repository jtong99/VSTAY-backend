const redis = require("redis");

const { port, host } = require("./vars").service.redis;

module.exports = () => {
  try {
    const client = redis.createClient({
      host,
      port,
    });

    console.log("Redis connection established");

    return client;
  } catch (error) {
    console.log(
      "Redis connection disconnected with error: " + JSON.stringify(error)
    );
    process.exit(1);
  }
};
