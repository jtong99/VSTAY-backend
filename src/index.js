const { app } = require("./config/express");

const { connect: dbConnect } = require("./config/mongo");

const { connectES } = require("./config/elastic");

const { port, domain, env } = require("./config/vars");

let appInstance;
const startApp = async () => {
  const dbConnection = await dbConnect();
  const ESConnection = await connectES();

  app.locals.db = dbConnection;
  app.locals.ESClient = ESConnection;

  app.listen(port, () =>
    console.log(`Servers is listening on ${domain.API} (${env})`)
  );

  return app;
};

appInstance = startApp();

module.exports = { appInstance };
