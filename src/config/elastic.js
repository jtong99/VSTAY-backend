const { ES } = require("./vars");

const { Client } = require("@elastic/elasticsearch");

module.exports.connectES = () => {
  try {
    const client = new Client({
      node: "http://elasticsearch:9200",
      maxRetries: 5,
      requestTimeout: 60000,
      sniffOnStart: true,
    });

    // client.ping(
    //   {
    //     // ping usually has a 3000ms timeout
    //     requestTimeout: Infinity,
    //     // undocumented params are appended to the query string
    //     hello: "elasticsearch!",
    //   },
    //   function (error) {
    //     if (error) {
    //       console.log(error);
    //       console.trace("elasticsearch cluster is down!");
    //     } else {
    //       console.log("All is well");
    //     }
    //   }
    // );

    return client;
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
};
