const httpStatus = require("http-status");
const APIError = require("../utils/APIErr");

const { PostType } = require("../../config/config.enum");

class ESNeedPost {
  constructor(ESclient) {
    this.ESclient = ESclient;
    this.index = "need-posts";
    this.type = "need-post";
  }
  async createOne(postID, postObj) {
    try {
      var clone = Object.assign({}, postObj);
      delete clone._id;
      const result = await this.ESclient.index({
        id: postID.toString(),
        index: "need-posts",
        type: "need-post",
        body: clone,
      });
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  async searchVideos(keyword, sort, pagination) {
    try {
      // const filterQuerys = [
      //     {
      //         term: { uploadStatus: VideoUploadStatusEnum.APPROVED },
      //     }
      // ];
      const filterQuerys = [];
      filterQuerys.push({
        nested: {
          path: "address",
          query: {
            bool: {
              must: [{ match: { "address.name": keyword } }],
            },
          },
        },
      });
      // for (const i in filter) {
      //     const val = filter[i];
      //     const filterQuery = {

      //         nested: {
      //             path: 'features',
      //             query: {
      //                 bool: {
      //                     must: [
      //                         { match: { 'features.name': val.name } },
      //                         { match: { 'features.value': val.value } },
      //                     ],
      //                 },
      //             },
      //         },

      //     };
      //     filterQuerys.push(filterQuery);
      // }

      const multiMatchQueries = [];
      const wordArr = keyword.split(" ");
      wordArr.forEach((element) => {
        multiMatchQueries.push({
          multi_match: {
            query: element,
            type: "phrase_prefix",
            fields: ["about.name"],
          },
        });
      });

      const result = await this.ESclient.search({
        index: "need-posts",
        type: "need-post",
        body: {
          min_score: 0.5,
          query: {
            bool: {
              should: multiMatchQueries,
              // filter: {
              //   bool: {
              //     must: filterQuerys,
              //   },
              // },
            },
          },
          sort: [sort],
          size: pagination.pageSize,
          from: pagination.pageSize * pagination.pageNumber,
        },
      });
      return result;
    } catch (error) {
      console.log(error.meta.body.error);
      throw new APIError({
        message: "Failed on searching post",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }
  async fullDocUpdateByID(_id, data) {
    try {
      const result = await this.ESclient.update({
        index: this.index,
        type: this.type,
        id: _id.toString(),
        body: {
          doc: data,
        },
      });
      return result;
    } catch (error) {
      throw new APIError({
        message: "Failed on updating need post",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }
}

module.exports = ESNeedPost;
