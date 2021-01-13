const fs = require("fs");
const { ObjectID } = require("mongodb");

const { Client } = require("@elastic/elasticsearch");
const path = require("path");

const { ES } = require("../config/vars");

const ESClient = new Client({
  node: "http://localhost:9200",
});

function readData(filename) {
  const pathToDataFolder = "../../docs/data/";
  const pathToFile = path.join(
    __dirname,
    pathToDataFolder,
    `${filename}.test.json`
  );
  const srcData = fs.readFileSync(pathToFile);
  const data = JSON.parse(srcData);
  return data;
}

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

  data.forEach((item) => {
    const parsedData = MongoParse(item);
    importData.push(parsedData);
  });
  return importData;
}

const deleteIndex = async () => {
  /* Delete index */
  try {
    const result = await ESClient.indices.delete({
      index: "share-posts",
    });
    return result;
  } catch (e) {
    return;
  }
};

const makeIndex = async () => {
  const result = await ESClient.indices.create({
    index: "share-posts",
  });
  return result;
};

const putMapping = async () => {
  console.log("Creating Mapping index");
  const result = await ESClient.indices.putMapping({
    index: "share-posts",
    type: "share-post",
    includeTypeName: true,
    body: {
      "share-post": {
        properties: {
          address: {
            properties: {
              geocode: {
                properties: {
                  latitude: {
                    type: "float",
                  },
                  longitude: {
                    type: "float",
                  },
                },
              },
              name: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    ignore_above: 256,
                  },
                },
              },
            },
          },
          createdAt: {
            type: "date",
          },
          description: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256,
              },
            },
          },
          detail: {
            properties: {
              bills: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    ignore_above: 256,
                  },
                },
              },
              depositLength: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    ignore_above: 256,
                  },
                },
              },
              except: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    ignore_above: 256,
                  },
                },
              },
              furnishing: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    ignore_above: 256,
                  },
                },
              },
              internet: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    ignore_above: 256,
                  },
                },
              },
              length: {
                type: "long",
              },
              max_people_live_with: {
                type: "long",
              },
              parking: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    ignore_above: 256,
                  },
                },
              },
              room_availability: {
                properties: {
                  date_availability: {
                    type: "long",
                  },
                  max_length_of_stay: {
                    type: "long",
                  },
                  min_length_of_stay: {
                    type: "long",
                  },
                },
              },
              toilets: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    ignore_above: 256,
                  },
                },
              },
              total_bathrooms: {
                type: "long",
              },
              total_bedrooms: {
                type: "long",
              },
              width: {
                type: "long",
              },
            },
          },
          features: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256,
              },
            },
          },
          images: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256,
              },
            },
          },
          poster: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256,
              },
            },
          },
          price: {
            type: "long",
          },
          statistics: {
            properties: {
              dislikeCount: {
                type: "long",
              },
              likeCount: {
                type: "long",
              },
              viewCount: {
                type: "long",
              },
            },
          },
          status: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256,
              },
            },
          },
          target: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256,
              },
            },
          },
          title: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256,
              },
            },
          },
          type: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256,
              },
            },
          },
          type_of_post: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256,
              },
            },
          },
          updatedAt: {
            type: "date",
          },
        },
      },
    },
  });
  return result;
};

const indexall = async (madebulk) => {
  const result = await ESClient.bulk({
    index: "share-posts",
    type: "share-post",
    body: madebulk,
  });
  return result;
};

const makebulk = async (data) => {
  const bulk = [];

  data.forEach((item) => {
    const object = { ...item };

    // the _id is uniqe and consider as index value
    delete object._id;

    bulk.push(
      {
        index: { _index: "share-posts", _id: item._id },
      },
      object
    );
  });
  return bulk;
};

const main = async () => {
  const data = readData("post");

  const parsedData = prettyData(data);
  // console.log(parsedData);
  try {
    const deleteResult = await deleteIndex();
    console.log(deleteResult);
    const makeResult = await makeIndex();
    console.log(makeResult);
    const putResult = await putMapping();
    console.log(putResult);
    const madebulk = await makebulk(parsedData);
    console.log(madebulk);
    const indexAll = await indexall(madebulk);
    console.log(indexAll);
  } catch (error) {
    console.log(error.body.error);
  }
};

main();
