const httpStatus = require("http-status");
const Model = require("../models");
const ESModel = require("../ESModel");
const { hostname } = require("../../config/vars");
const path = require("path");
const { moveFile, createFolderIfNotExists } = require("../helpers/fileSystem");
const { isValidID } = require("../helpers/validate");
const { ObjectID } = require("mongodb");
const { ESsortItems } = require("../helpers/post");

module.exports.addPost = async (req, res, next) => {
  try {
    const { db, ESClient } = req.app.locals;
    const { NeedPost } = new Model({ db });
    const { NeedESPost } = new ESModel({ ESClient });
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
      releasedAt: null,
      statistics: {
        viewCount: 0,
        likeCount: 0,
        dislikeCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await NeedPost.insertOne(postObject);
    const postID = result._id;
    const pushES = await NeedESPost.createOne(postID, postObject);
    console.log(pushES);
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

module.exports.getAllNeedPost = async (req, res, next) => {
  const { db } = req.app.locals;
  const { NeedPost } = new Model({ db });
  const { sortBy, pageSize, pageNumber } = req.query;
  const pagination = {};
  pagination["pageSize"] = pageSize ? parseInt(pageSize) : 0;
  pagination["pageNumber"] = pageNumber ? parseInt(pageNumber) - 1 : 0;

  const sort = sortBy ? sortItems[sortBy] : {};

  try {
    const result = await NeedPost.getAllNeedPost(pagination, sort);
    if (!result || result === null || result === undefined) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "All of Post is not found",
        })
        .end();
    }

    const response = {
      code: httpStatus.OK,
      message: "Get all of Post sucessfully",
      result: result,
    };
    return res.status(response.code).json(response).end();
  } catch (error) {
    next(error);
  }
};

module.exports.searchNeedPosts = async (req, res, next) => {
  try {
    // system consts
    const { db, ESClient } = req.app.locals;
    const { NeedESPost } = new ESModel({ ESClient });
    // const {
    //   User,
    //   Friendship,
    //   UserVideo,
    //   userVideoList,
    //   reactions,
    //   view,
    //   share,
    // } = new Model({ db });

    const { pageSize, pageNumber, keyword, sortBy } = req.query;
    const pagination = {
      pageNumber: parseInt(pageNumber) - 1,
      pageSize: parseInt(pageSize),
    };

    const sort =
      sortBy !== null && sortBy !== undefined ? ESsortItems[sortBy] : {};

    // const filter = [];
    // for (const i in videoFeatures) {
    //   const key = videoFeatures[i];
    //   const val = _.get(req.query, `${key}`, null);
    //   if (val) {
    //     filter.push({
    //       name: key,
    //       value: val,
    //     });
    //   }
    // }
    const result = await NeedESPost.searchVideos(keyword, sort, pagination);
    console.log(result.body.hits.total);
    if (!result || result.body.hits.total.value <= 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "Posts are not found",
        })
        .end();
    }

    if (result.body.hits.hits.length <= 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "There is no posts on current page",
          total: result.hits.total.value,
          pagination: {
            pageNumber: pageNumber,
            pageSize: pageSize,
          },
        })
        .end();
    }

    // if (req.user && req.user._id) {
    //   const currentUserID = req.user._id;

    //   const hits = result.hits.hits;
    //   for (const i in hits) {
    //     const val = hits[i];
    //     hits[
    //       i
    //     ]._source.watchingStatus = await UserVideo.getUserVideoByUserAndVideoId(
    //       currentUserID,
    //       new ObjectID(val._id)
    //     );
    //     hits[i]._source.saved = await userVideoList.isVideoInList(
    //       new ObjectID(val._id),
    //       "saved",
    //       currentUserID
    //     );
    //   }
    // }
    // // Get video detail
    // const items = result.hits.hits;
    // for (let i = 0; i < items.length; i++) {
    //   item = items[i];
    //   const authorID = new ObjectID(item._source.author);
    //   const authorDetail = await User.getUserById(authorID, {
    //     _id: 1,
    //     name: 1,
    //     avatar: 1,
    //   });

    //   if (authorDetail) {
    //     const followers = await Friendship.getFollowers(
    //       new ObjectID(authorID),
    //       {
    //         pageNumber: 1,
    //         pageSize: 1,
    //       },
    //       {
    //         prob: "followedAt",
    //         order: "desc",
    //       }
    //     );
    //     followers
    //       ? (authorDetail.followersCount = followers.count)
    //       : (authorDetail.followersCount = 0);
    //   }
    //   authorDetail
    //     ? (item._source.author = authorDetail)
    //     : (item._source.author = "Not Found");

    //   const videoID = new ObjectID(item._id);

    //   const reactionCountObj = await reactions.getReactionsCount(videoID);
    //   const viewCountObj = await view.getViewCountByVideoID(videoID);
    //   const sharesCountObj = await share.getShareCountByVideoID(videoID);

    //   const statistics = {
    //     likeCount: reactionCountObj.likeCount,
    //     dislikeCount: reactionCountObj.dislikeCount,
    //     viewCount: viewCountObj.viewCount,
    //     sharedCount: sharesCountObj.sharedCount,
    //   };

    //   item._source.statistics = statistics;
    // }

    return res
      .status(httpStatus.OK)
      .json({
        code: httpStatus.OK,
        message: "Search post successfully",
        keyword: keyword,
        // filter: filter,
        sort: sort,
        pagination: {
          pageSize: pageSize,
          pageNumber: pageNumber,
        },
        result: result.body.hits,
      })
      .end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.createNewReactionOnNeedPost = async (req, res, next) => {
  const currentUserID = req.user._id;

  const { db } = req.app.locals;
  const { reactions, NeedPost } = new Model({ db });

  try {
    const postID = new ObjectID(req.params.postID);
    const userReaction = req.params.reactionType.toLowerCase();
    const reactionObj = {
      userID: currentUserID,
      createdAt: new Date(),
    };

    // Check reaction document exist
    const reactionDoc = await reactions.getOneByPostID(postID);
    if (
      !reactionDoc ||
      reactionDoc === null ||
      reactionDoc === undefined ||
      reactionDoc.length <= 0
    ) {
      const createNewReactionDoc = await reactions.insertOne({
        postID: postID,
        like: [],
        dislike: [],
      });
      if (
        !createNewReactionDoc ||
        createNewReactionDoc === null ||
        createNewReactionDoc === undefined
      ) {
        return res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({
            code: httpStatus.INTERNAL_SERVER_ERROR,
            message: "Failed on creating new creaction",
          })
          .end();
      }
    }

    const pullExisted = await reactions.pull(postID, currentUserID);
    if (!pullExisted || pullExisted === null || pullExisted === undefined) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: "Push reaction process has been stoped",
          reason: "Failed on pull existed process",
        })
        .end();
    }

    const result = await reactions.push(postID, userReaction, reactionObj);

    const updateVideoStatisticsBlock = await NeedPost.updateStatistics(postID, {
      likeCount: result.like.length,
      dislikeCount: result.dislike.length,
    });

    return res
      .status(httpStatus.OK)
      .json({
        code: httpStatus.OK,
        message: `${userReaction} video successfully`,
        result: {
          yourReaction: userReaction,
          likeCount: result.like.length,
          dislikeCount: result.dislike.length,
        },
      })
      .end();
  } catch (error) {
    next(error);
  }
};
