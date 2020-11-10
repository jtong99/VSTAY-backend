const multer = require("multer");
const path = require("path");
const validator = require("validator");

const pathToUploadFolder = path.join(__dirname, "../uploads");

const { createFolderIfNotExists } = require("../helpers/fileSystem");
createFolderIfNotExists(pathToUploadFolder);

function validateMimeType(mimetype) {
  const validUploadedImage = /image\/(|jpg|jpeg|png)$/;
  if (!validator.matches(mimetype.toLowerCase(), validUploadedImage)) {
    throw new Error("Invalid uploaded file");
  }
}

const storage = multer.diskStorage({
  destination: (req, file, done) => {
    done(null, pathToUploadFolder);
  },
  filename: (req, file, done) => {
    try {
      validateMimeType(file.mimetype);
    } catch (error) {
      console.log(error);
      done(error);
    }
    const { _id } = req.user;
    const { fieldname, originalname } = file;
    done(null, `${fieldname}-${new Date().getTime()}-${_id}-${originalname}`);
  },
});

module.exports.upload = multer({ storage: storage });
