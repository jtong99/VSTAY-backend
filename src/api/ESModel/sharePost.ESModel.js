const httpStatus = require("http-status");
const APIError = require("../utils/APIErr");

const { PostType, PostStatus } = require("../../config/config.enum");

class ESPost {
  constructor(ESclient) {
    this.ESclient = ESclient;
    this.index = "share-posts";
    this.type = "share-post";
  }
  async createOne(postID, postObj) {
    try {
      var clone = Object.assign({}, postObj);
      delete clone._id;
      const result = await this.ESclient.index({
        id: postID.toString(),
        index: "share-posts",
        type: "share-post",
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
      const filterQuerys = [
        {
          term: { status: PostStatus.PENDING },
        },
      ];
      // filterQuerys.push({
      //   nested: {
      //     path: "address",
      //     query: {
      //       bool: {
      //         must: [{ match: { "address.name": keyword } }],
      //       },
      //     },
      //   },
      // });
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
            fields: ["title", "description", "address.name"],
          },
        });
      });

      const result = await this.ESclient.search({
        index: "share-posts",
        type: "share-post",
        body: {
          min_score: 0,
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

  async partialUpdateByID(_id, data) {
    try {
      const result = await this.ESclient.updateByQuery({
        index: this.index,
        type: this.type,
        body: {
          query: {
            match: {
              _id: _id,
            },
          },
          script: {
            inline: data,
          },
        },
      });
      return result;
    } catch (error) {
      throw new APIError({
        message: "Failed on updating post, ES",
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
        message: "Failed on updating post",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: error.errors,
      });
    }
  }
}

module.exports = ESPost;
