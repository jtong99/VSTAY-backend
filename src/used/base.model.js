const { ObjectID } = require("mongodb");
const httpStatus = require("http-status");
const _ = require("lodash");

const APIError = require("../api/utils/APIErr");
const { Models } = require("../config/vars");
const { isInEnum, enumToArray } = require("../api/helpers/enum");

class BaseModel {
  constructor() {
    this.setId().setCreatedAt().setUpdatedAt();

    this.collectionName;
    this.collection;
    this.modelsName = Models;

    this.validator = {
      isString: function (val, label) {
        if (typeof val !== "string") {
          throw new Error(`${label} must be a string`);
        }
      },
      isNumber: function (val, label) {
        if (typeof val !== "number") {
          throw new Error(`${label} must be a number`);
        }
      },
      isInEnum: function (val, enums, label) {
        if (!isInEnum(val, enums)) {
          throw new Error(`${label} must be ${enumToArray(enums)}`);
        }
      },
      isInLength: function (val, range, label) {
        const min = range.min || 0;
        const max = range.max;

        if (val.length < min) {
          throw new Error(`${label} must be at least ${min} character(s)`);
        }

        if (val.length > max) {
          throw new Error(`${label} must be at last ${max} character(s)`);
        }
      },
      isRequired: function (val, label) {
        if (!val) {
          throw new Error(`${label} is required`);
        }
      },
      toObjectId: (prop) => {
        this[`_${prop}`] = this.toObjectId(this[`_${prop}`]);
      },
    };
  }

  /**
   * Get properties of model that have _ as a prefix
   *
   * @returns {any}
   */
  getModel() {
    const privateProp = "_";
    const model = {};

    model._id = this._id;
    for (const prop in this) {
      if (prop.charAt(0) === privateProp) {
        model[prop.slice(1)] = this[prop] || "";
      }
    }
    delete model.id;

    return model;
  }

  /**
   * Set mongodb objectid
   * @param {string | ObjectID} id
   *
   * @returns {BaseModel}
   */
  setId(id = new ObjectID()) {
    this._id = this.toObjectId(id);
    return this;
  }

  /**
   * Set data creation date
   * @param {Date} date
   *
   * @returns {BaseModel}
   */
  setCreatedAt(date = new Date()) {
    this._createdAt = date;
    return this;
  }

  /**
   * Set data last modification date
   * @param {Date} date
   *
   * @returns {BaseModel}
   */
  setUpdatedAt(date = new Date()) {
    this._updatedAt = date;
    return this;
  }

  /**
   * Set properties for models
   * @param {Object} data
   *
   * @returns {BaseModel}
   */
  setProp(data = {}) {
    for (let prop in data) {
      this[`_${prop}`] = data[prop] || "";
    }

    return this;
  }

  /**
   * @description hook
   * Validate input
   * This method will be override in child models
   *
   * @param {Object} data
   *
   * @returns {void}
   */
  validate() {}

  /**
   * Save data to collection
   * @param {Object} data
   *
   * @returns {Promise<any>}
   */
  async create(data = {}) {
    this.setProp(data);

    await this.validate();
    const model = this.getModel();

    await this.collection.insertOne(model);

    return this.getModel();
  }

  /**
   * Get all data
   * @param {object} filter
   * @param {1} filter.pageNumber - Page number for pagination
   * @param {10} filter.pageSize - Page size for pagination
   *
   * @returns {Promise<{
   *  total: number,
   *  data: any[],
   * }>}
   */
  async getAll(filter = {}) {
    const pageNumber = parseInt(_.get(filter, "pageNumber", 0), 10);
    const pageSize = parseInt(_.get(filter, "pageSize", 10), 10);

    delete filter.pageNumber;
    delete filter.pageSize;

    const cursor = await this.collection.find(filter);
    const total = await cursor.count();
    const data = await cursor
      .skip(Math.abs(pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return {
      total: total,
      data: data,
    };
  }

  /**
   * Convert to ObjectId
   * @param {string | ObjectID} id - Input id.
   *
   * @returns {string<ObjectID>}
   */
  toObjectId(id) {
    if (typeof id === "string" && id.length !== 24) {
      throw new Error(`Invalid id format ${id}`);
    }

    return new ObjectID(id.toString());
  }

  /**
   * Get all data in a collection for testing
   *
   * @returns {Promise<any[]>}
   */
  async getCollection() {
    return await this.collection.find({}).toArray();
  }

  /**
   * Drop the entire collection data
   * @returns {Promise<any>}
   */
  async dropCollection() {
    this.dropCollectionHook();
    return await this.collection.deleteMany({});
  }
}

module.exports = BaseModel;
