const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const { addHours, addMinutes, getUnixTime, format } = require("date-fns");

const APIError = require("../utils/APIErr");
const { secretOrPrivateKey, Models } = require("../../config/vars");
const { isValidId } = require("../helpers/db");
const BaseModel = require("../../used/base.model");

const { value: tokenSecret, refreshTokenExpiration } = secretOrPrivateKey;

async function generateToken({
  payload,
  expiresIn,
  expiresUnit,
  secretKey = this.secretKey,
}) {
  try {
    if (!payload || !Object.keys(payload)) {
      throw new APIError({
        message: "Cannot generate access token",
        status: httpStatus.BAD_REQUEST,
        isPublic: true,
        errors: [
          {
            field: "payload",
            location: "body",
            message: "pass data to payload to generate access token",
          },
        ],
      });
    }

    if (expiresUnit !== "hour" && expiresUnit !== "minute") {
      throw new APIError({
        message: "Expire unit must be minute or hour",
        status: httpStatus.BAD_REQUEST,
        isPublic: false,
        errors: [
          {
            field: "expiresUnit",
            location: "GenerateToken",
            message: "",
          },
        ],
      });
    }

    const currentTimeInMilSec = Date.now();
    const iat = getUnixTime(currentTimeInMilSec);
    const exp =
      expiresUnit === "hour"
        ? getUnixTime(addHours(currentTimeInMilSec, expiresIn))
        : getUnixTime(addMinutes(currentTimeInMilSec, expiresIn));

    const generatedToken = await jwt.sign(
      {
        data: payload,
        iat: iat,
        exp: exp,
      },
      secretKey
    );

    return {
      token: generatedToken,
      iat: iat,
      exp: exp,
    };
  } catch (error) {
    throw new APIError({
      message: error.message || "Error generating access token",
      status: error.status || httpStatus.INTERNAL_SERVER_ERROR,
      stack: error.stack || error.stack,
      isPublic: error.isPublic || false,
      errors: error.errors,
    });
  }
}

function verifyToken(token) {
  let isValid = true;
  // invalid token
  jwt.verify(token, this.secretKey, function (error, decoded) {
    if (decoded === undefined || error) {
      isValid = false;
    }
  });
  return isValid;
}

function decodeToken(token) {
  // get the decoded payload and header
  const decoded = jwt.decode(token, { complete: true });

  return decoded.payload;
}

class Token extends BaseModel {
  constructor(db) {
    super();
    this.collectionName = Models.REFRESH_TOKEN;
    this.collection = db.collection(this.collectionName);

    this.refreshTokenExpiration = parseInt(refreshTokenExpiration);
    this.secretKey = tokenSecret;

    this.generateToken = generateToken.bind(this);
    this.verifyToken = verifyToken.bind(this);
    this.decodeToken = decodeToken.bind(this);
  }

  async createNewRefreshToken({ payload }) {
    try {
      const expiresIn = this.refreshTokenExpiration;
      const { _id: userId } = payload;

      const { token, iat, exp } = await this.generateToken({
        payload: userId,
        expiresIn,
        expiresUnit: "hour",
      });

      const newRefreshToken = await this.collection.insertOne({
        value: token,
        userId: userId,
        exp: exp,
        iat: iat,
        updatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:sszzzz"),
      });

      return newRefreshToken.ops[0];
    } catch (error) {
      throw new APIError({
        message: error.message || "Error generating access token",
        status: error.status || httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack || error.stack,
        isPublic: error.isPublic || false,
        errors: error.errors,
      });
    }
  }
  async updateOrCreateTokenByUserId(
    _id,
    { payload, expiresIn = this.refreshTokenExpiration }
  ) {
    try {
      const secretKey = this.secretKey;
      const { user, agent } = payload;
      const userId = user._id;

      const { token, iat, exp } = await this.generateToken({
        payload: userId,
        secretKey,
        expiresIn,
        expiresUnit: "hour",
      });

      const updatedUser = await this.collection.findOneAndUpdate(
        {
          userId: { $eq: userId },
          "user-agent": agent,
        },
        {
          $set: {
            "user-agent": agent,
            value: token,
            iat: iat,
            exp: exp,
            userId: userId,
            updatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:sszzzz"),
          },
        },
        {
          returnOriginal: false,
          upsert: true,
        }
      );

      return updatedUser.value;
    } catch (error) {
      throw new APIError({
        message: error.message || "Error generating access token",
        status: error.status || httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack || error.stack,
        isPublic: error.isPublic || false,
        errors: error.errors,
      });
    }
  }
  async getTokenByValue(token) {
    try {
      const refreshToken = await this.collection.findOne({
        value: {
          $eq: token,
        },
      });

      return refreshToken;
    } catch (error) {
      throw new APIError({
        message: error.message || "Error getting refresh token by user id",
        status: error.status || httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: error.isPublic || false,
        errors: [
          {
            field: "",
            location: "",
            message: "",
          },
        ],
      });
    }
  }

  async getByUserIdAndAgent(user, agent) {
    const userId = this.toObjectId(user);

    const token = await this.collection.findOne({
      userId: userId,
      "user-agent": agent,
    });

    return token;
  }

  async deleteTokenById(_id) {
    try {
      const token = await this.collection.deleteOne({
        _id: {
          $eq: _id,
        },
      });

      return token.deletedCount;
    } catch (error) {
      throw new APIError({
        message: error.message || "Error generating access token",
        status: error.status || httpStatus.INTERNAL_SERVER_ERROR,
        stack: error.stack,
        isPublic: error.isPublic || false,
        errors: error.errors,
      });
    }
  }
}

module.exports = Token;
