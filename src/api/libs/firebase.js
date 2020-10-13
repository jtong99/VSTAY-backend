const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://vstay-f8c57.firebaseio.com",
  });
} catch (error) {
  console.log(
    `Error initializing Firebase app, StackTrace: ${JSON.stringify(error)}`
  );
}

module.exports = admin;
