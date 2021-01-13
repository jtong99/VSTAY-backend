const { MongoClient, ObjectID } = require("mongodb");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { enumToArray } = require("../api/helpers/enum");
const { Models } = require("../config/vars");
const { urlMongo } = require("../config/vars").migration;
const { name, uri } = require("../config/vars").database;

function MongoParse(query) {
  let key, val;
  for (key in query) {
    if (!query.hasOwnProperty(key)) continue;
    val = query[key];
    switch (key) {
      case "$date":
        return new Date(val);
      case "$regex":
        return new RegExp(val, query.$options);
      case "$oid":
        return new ObjectID(val);
      case "$undefined":
        return undefined;
    }
    if (typeof val === "object") query[key] = MongoParse(val);
  }
  return query;
}

function prettyData(data) {
  const importData = [];
  for (let i = 0; i < data.length; i++) {
    const jsonObject = data[i];
    const parsedData = MongoParse(jsonObject);

    importData.push(parsedData);
  }
  return importData;
}

function importData(rawData, collection) {
  const data = prettyData(rawData);
  MongoClient.connect(
    urlMongo,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      if (err) throw err;

      client
        .db(name)
        .collection(collection)
        .deleteMany({}, (err, res) => {
          if (err) throw err;

          console.log(
            `${chalk.bgRedBright("(DELETE)")} ${
              res.deletedCount
            } rows in collection ${chalk.bold(collection)}`
          );

          client
            .db(name)
            .collection(collection)
            .insertMany(data, (err, res) => {
              if (err) throw err;

              console.log(
                `${chalk.bgCyan("(INSERT)")} ${
                  res.insertedCount
                } rows in collection ${chalk.bold(collection)}`
              );
              client.close();
            });
        });
    }
  );
}

function readData(filename) {
  const pathToDataFolder = "../../docs/data";
  const pathToFile = path.join(
    __dirname,
    pathToDataFolder,
    `${filename}.test.json`
  );
  const srcData = fs.readFileSync(pathToFile, "utf8");
  const data = JSON.parse(srcData);
  return data;
}

function main() {
  const collectionsName = { ...Models };
  delete collectionsName.VIEW;
  const collectionList = enumToArray(collectionsName);

  const collection = process.argv.slice(2)[0];
  console.log(collection);

  console.log(`Data is seeding into (${chalk.bgMagentaBright(name)})`);
  if (collection === "all") {
    collectionList.forEach((item) => {
      const data = readData(item);

      importData(data, item);
    });

    return;
  }

  const isInCollectionList = collectionList.find((item) => item === collection);
  if (!isInCollectionList) {
    throw new Error(
      "No collection in database named: " + chalk.bgRedBright(collection)
    );
  }
  try {
    const data = readData(collection);
    importData(data, collection);
  } catch (error) {
    console.log(error);
  }

  return;
}

main();
