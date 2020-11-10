const httpStatus = require("http-status");
const Model = require("../models");
const ESModel = require("../ESModel");
const { hostname } = require("../../config/vars");
const path = require("path");
const { moveFile, createFolderIfNotExists } = require("../helpers/fileSystem");

module.exports.addPost = async (req, res, next) => {
  try {
    const { db, ESClient } = req.app.locals;
    const { Post } = new Model({ db });
    // const { ESPost } = new ESModel({ ESClient });
    const body = req.body;
    const postObject = {
      title: body.title,
      type: body.type,
      address: body.address,
      detail: body.detail,
      features: body.features,
      description: body.description,
      images: body.images,
      price: body.price,
      poster: req.user._id,
    };
    const result = await Post.insertOne(postObject);
    const postID = result._id;
    const pushES = await ESPost.createOne(postID, postObject);
    console.log(pushES);
    // console.log(ESPost);
    if (
      (pushES && pushES.body && !pushES.body.result) ||
      pushES.body.result !== "created"
    ) {
      const deleteResult = await Post.deleteById(new ObjectID(postID));
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: "Some thing is wrong with ES",
          redo: deleteResult,
          error: pushES,
        })
        .end();
    }

    return res
      .status(httpStatus.CREATED)
      .json({
        code: httpStatus.CREATED,
        message: "Insert sucessfully",
        inserted: result,
      })
      .end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.uploadImages = async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const { Post } = new Model({ db });
    let imageArr = [];

    try {
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          imageArr.push(
            `${hostname}/uploads/post-images/` + req.files[i].filename
          );
          const imagesUploadingFolder = path.join(
            __dirname,
            "../uploads/post-images"
          );

          const postImgPath = path.join(
            imagesUploadingFolder,
            req.files[i].filename
          );
          createFolderIfNotExists(imagesUploadingFolder);
          // move uploaded images in /uploads folder to /uploads/images folder
          await moveFile(req.files[i].path, postImgPath);
        }
      }
    } catch (error) {
      next(error);
    }
    console.log(imageArr);
    return res
      .status(httpStatus.CREATED)
      .json({
        code: httpStatus.CREATED,
        message: "Uploaded images sucessfully",
        inserted: imageArr,
      })
      .end();
  } catch (error) {
    next(error);
  }
};
