const httpStatus = require("http-status");

const { ObjectId, ObjectID } = require("mongodb");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

const APIError = require("../utils/APIErr");
const { env } = require("../../config/vars");

const BaseModel = require("../../used/base.model");

const { generateFakeAvatar } = require("../helpers/fake");

const { UserStatusEnum, UserRolesEnum } = require("../../config/config.enum");

async function hashPassword(password) {
  const saltRounds = env === "test" ? 1 : 10;

  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new APIError({
      message: "Error hashing user password",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      stack: error.stack,
      isPublic: false,
    });
  }
}

/**
 * Compare password
 * @param {string} candidatePassword
 * @param {string} hashedPassword
 * @throws {APIError} Unexpected error
 * @returns {boolean}
 */
comparePassword = async function (candidatePassword, hashedPassword) {
  try {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  } catch (error) {
    throw new APIError({
      message: "Error comparing passwords",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      stack: error.stack,
      isPublic: false,
    });
  }
};

transform = function (user) {
  delete user.password;
  delete user.createdAt;
  delete user.updatedAt;

  return user;
};

class User extends BaseModel {
  constructor(db) {
    super();
    this.collectionName = this.modelsName.USER;
    this.collection = db.collection(this.collectionName);
    this.db = db;

    this.comparePassword = comparePassword.bind(this);
    this.hashPassword = hashPassword.bind(this);
    this.transform = transform.bind(this);
  }

  async createUser(data = {}) {
    const { name, email, password } = data;
    const avatar = _.get(data, "avatar", "");
    const language = _.get(data, "language", "");

    try {
      const date = new Date();

      const hashedPassword = await hashPassword(password);
      //   const encryptedEmail = encrypt(email.toLowerCase());

      const newUser = await this.collection.insertOne({
        _id: new ObjectId(),
        email: email,
        name,
        password: hashedPassword,
        role: UserRolesEnum.FREE,
        status: UserStatusEnum.ACTIVE,
        about: "",
        avatar: avatar ? avatar : generateFakeAvatar(name),
        skills: [],
        social: {
          facebook: "",
          linkedin: "",
          youtube: "",
          instagram: "",
        },
        headline: "",
        language: language,
        createdAt: date,
        updatedAt: date,
      });

      return newUser.ops[0];
    } catch (error) {
      throw new APIError({
        message: error.message || "Error creating new user",
        status: error.status || httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
      });
    }
  }

  async getUserByEmail(email = "") {
    try {
      // const encryptedEmail = encrypt(email.toLowerCase());
      const user = await this.collection
        .find({ email: { $eq: email } }, { limit: 1 })
        .next();
      console.log(user);
      if (!user) {
        return user;
      }

      return { ...user };
    } catch (error) {
      throw new APIError({
        message: "Error getting user by user email",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: [
          {
            field: "getUserByEmail",
            location: "Users Collection",
            message: "",
          },
        ],
      });
    }
  }

  async getUserByName(name, projection = {}) {
    try {
      const user = await this.collection
        .find(
          {
            name: { $eq: name },
          },
          {
            limit: 1,
            projection,
          }
        )
        .next();

      if (!user) {
        return user;
      }

      return { ...user };
    } catch (error) {
      throw new APIError({
        message: "Error getting user by user name",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: false,
        errors: [
          {
            field: "getUserByName",
            location: "Users Collection",
            message: "",
          },
        ],
      });
    }
  }

  getUserById = async (id, projection = {}) => {
    const _id = this.toObjectId(id);

    try {
      const user = await this.collection.findOne({ _id: _id }, { projection });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw new APIError({
        message: error.message || "Error getting user by user id",
        status: error.status || httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack || error.stack,
        isPublic: error.isPublic || false,
        errors: error.errors || [
          {
            field: "getUserById",
            location: "Users Collections",
            message: "",
          },
        ],
      });
    }
  };
}

module.exports = User;
