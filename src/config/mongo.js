const Promise = require("bluebird");

const { MongoClient, Logger } = require("mongodb");

const { database, env } = require("./vars");

const { uri, name } = database;

const options = {
  useUnifiedTopology: true,
  promiseLibrary: Promise,
};

const mongoClient = new MongoClient(uri, options);

let dbInstance;
module.exports.connect = async () => {
  try {
    if (mongoClient.isConnected()) {
      return dbInstance;
    }

    const client = await mongoClient.connect();
    console.log(`Database connection established (${name})`);

    const db = client.db(name);
    dbInstance = db;

    return db;
  } catch (error) {
    console.log("Error connecting to MongoDB");
    process.exit(0);
  }
};
