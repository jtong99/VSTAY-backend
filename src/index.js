const { app } = require("./config/express");

const { connect: dbConnect } = require("./config/mongo");

const { port, domain, env } = require("./config/vars");

let appInstance;
const startApp = async () => {
  const dbConnection = await dbConnect();

  app.locals.db = dbConnection;

  app.listen(port, () =>
    console.log(`Server is listening on ${domain.API} (${env})`)
  );

  return app;
};

appInstance = startApp();

module.exports = { appInstance };
