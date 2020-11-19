const httpStatus = require("http-status");
const Model = require("../models");
const ESModel = require("../ESModel");
const { hostname } = require("../../config/vars");
const path = require("path");
const { moveFile, createFolderIfNotExists } = require("../helpers/fileSystem");
const { isValidID } = require("../helpers/validate");
const { ObjectID } = require("mongodb");

module.exports.addPost = async (req, res, next) => {
  try {
    const { db, ESClient } = req.app.locals;
    const { NeedPost } = new Model({ db });
    // const { ESPost } = new ESModel({ ESClient });
    const body = req.body;
    const postObject = {
      about: body.about,
      budget: body.budget,
      type: body.type,
      employment_status: body.employment_status,
      length_of_stay: body.length_of_stay,
      life_style: body.life_style,
      location: body.location,
      move_date: body.move_date,
      detail: body.detail,
      description: body.description,
      type_of_post: body.type_of_post,
      poster: req.user._id,
      status: body.status,
      type_of_post: body.type_of_post,
    };
    const result = await NeedPost.insertOne(postObject);
    const postID = result._id;
    // const pushES = await ESPost.createOne(postID, postObject);
    // console.log(pushES);
    // console.log(ESPost);
    // if (
    //   (pushES && pushES.body && !pushES.body.result) ||
    //   pushES.body.result !== "created"
    // ) {
    //   const deleteResult = await Post.deleteById(new ObjectID(postID));
    //   return res
    //     .status(httpStatus.INTERNAL_SERVER_ERROR)
    //     .json({
    //       code: httpStatus.INTERNAL_SERVER_ERROR,
    //       message: "Some thing is wrong with ES",
    //       redo: deleteResult,
    //       error: pushES,
    //     })
    //     .end();
    // }

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
    const { NeedPost } = new Model({ db });

    const userID = req.user._id;
    console.log(userID);

    const { sortBy, pageSize, pageNumber } = req.query;

    const pagination = {};
    pagination["pageSize"] = pageSize ? parseInt(pageSize) : 0;
    pagination["pageNumber"] = pageNumber ? parseInt(pageNumber) - 1 : 0;

    const sort = sortBy ? sortItems[sortBy] : {};

    const returnObject = await NeedPost.getByUserId(userID, sort, pagination);
    const result = returnObject.resultArray;

    if (!result || result === null || result.length === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "Need Posts are not found",
        })
        .end();
    }
    return res
      .status(httpStatus.OK)
      .json({
        code: httpStatus.OK,
        message: "Get Need posts successfully",
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
  const { NeedPost } = new Model({ db });

  try {
    //== Get NeedPost by ID block
    const result = await NeedPost.getById(_id);
    console.log(result);
    if (!result || result === null || result === undefined) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "Need Post is not found",
        })
        .end();
    }

    const response = {
      code: httpStatus.OK,
      message: "Get Need Post sucessfully",
      result: result,
    };
    return res.status(response.code).json(response).end();
  } catch (error) {
    next(error);
  }
};
