const httpStatus = require("http-status");
const Model = require("../models");
const ESModel = require("../ESModel");
const { ObjectID } = require("mongodb");
const { hostname } = require("../../config/vars");
const path = require("path");
const { isValidID } = require("../helpers/validate");
const { moveFile, createFolderIfNotExists } = require("../helpers/fileSystem");

module.exports.addSharePost = async (req, res, next) => {
  try {
    const { db, ESClient } = req.app.locals;
    const { Post } = new Model({ db });
    const { ESPost } = new ESModel({ ESClient });
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
    // console.log(pushES);
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

module.exports.addPost = async (req, res, next) => {
  try {
    const { db, ESClient } = req.app.locals;
    const { Post } = new Model({ db });
    const { ESPost } = new ESModel({ ESClient });
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
      status: body.status,
      type_of_post: body.type_of_post,
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

module.exports.getPostsByUser = async (req, res, next) => {
  try {
    // TODO: Check object ID type
    const { db } = req.app.locals;
    const { Post } = new Model({ db });

    const userID = new ObjectID(req.query.userID);
    const { sortBy, pageSize, pageNumber } = req.query;

    const pagination = {};
    pagination["pageSize"] = pageSize ? parseInt(pageSize) : 0;
    pagination["pageNumber"] = pageNumber ? parseInt(pageNumber) - 1 : 0;

    const sort = sortBy ? sortItems[sortBy] : {};

    const returnObject = await Post.getByUserId(userID, sort, pagination);
    const result = returnObject.resultArray;
    console.log(userID);
    if (!result || result === null || result.length === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "Posts are not found",
        })
        .end();
    }
    return res
      .status(httpStatus.OK)
      .json({
        code: httpStatus.OK,
        message: "Get posts successfully",
        total: returnObject.total,
        pagination: {
          pageNumber: pageNumber,
          pageSize: pageSize,
        },
        sortBy: sortBy,
        result: result,
      })
      .end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.getPostById = async (req, res, next) => {
  if (!isValidID(req.params.postID)) {
    return res
      .status(httpStatus.UNPROCESSABLE_ENTITY)
      .json({
        code: httpStatus.UNPROCESSABLE_ENTITY,
        message: "Post ID is invalid",
      })
      .end();
  }
  const _id = new ObjectID(req.params.postID);
  const { db } = req.app.locals;
  const { Post } = new Model({ db });

  try {
    //== Get Post by ID block
    const result = await Post.getById(_id);
    if (!result || result === null || result === undefined) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "Post is not found",
        })
        .end();
    }

    const response = {
      code: httpStatus.OK,
      message: "Get Post sucessfully",
      result: result,
    };
    return res.status(response.code).json(response).end();
  } catch (error) {
    next(error);
  }
};
