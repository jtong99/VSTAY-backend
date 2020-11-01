const httpStatus = require("http-status");
const Model = require("../models");
const ESModel = require("../ESModel");

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
    next(error);
  }
};
