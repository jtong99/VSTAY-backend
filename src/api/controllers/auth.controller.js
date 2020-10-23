const httpStatus = require("http-status");
const { getUnixTime, parseISO } = require("date-fns");
const _ = require("lodash");

const {
  secretOrPrivateKey,
  feDomain,
  domain,
  env,
} = require("../../config/vars");
const { formatTimeIn8601 } = require("../helpers/date");

const { sendVerificationEmail } = require("../libs/sendMail");
const Model = require("../models");
const { accessTokenExpiration, refreshTokenExpiration } = secretOrPrivateKey;

const fbAdmin = require("../libs/firebase");

const { getUserAgent } = require("../helpers/hardware");

module.exports.signupProd = async (req, res, next) => {
  const { db } = req.app.locals;

  const { User, Token } = new Model({ db });

  const email = _.get(req.body, "email", "");
  const name = _.get(req.body, "name", "");
  const password = _.get(req.body, "password", "");

  try {
    const existedEmail = await User.getUserByEmail(email);
    console.log(existedEmail);
    if (existedEmail) {
      const response = {
        code: httpStatus.CONFLICT,
        message: "This email is already taken, choose another email",
      };

      return res.status(response.code).json(response).end();
    }
  } catch (error) {
    return next(error);
  }

  try {
    const existedName = await User.getUserByName(name);
    if (existedName) {
      const response = {
        code: httpStatus.CONFLICT,
        message: "This name is already taken, choose another name",
      };

      return res.status(response.code).json(response).end();
    }
  } catch (error) {
    return next(error);
  }
  const firebaseToken = _.get(req.body, "firebaseToken", "");
  if (!firebaseToken) {
    try {
      const payload = {
        email,
        password,
      };

      const registrationToken = await Token.generateToken({
        payload,
        expiresIn: 24,
        expiresUnit: "hour",
      });

      const maildata = {
        to: email,
        signupApi: `${domain.API}/v1/auth/signup/prod/create`,
        name: name,
        language: "en",
        token: registrationToken.token,
      };
      const expiration = formatTimeIn8601(registrationToken.exp);
      const sendEmailResult = await sendVerificationEmail(maildata);
      const response = {
        code: httpStatus.OK,
        message: "Verification code is sent, please check your mailbox.",
        expiration: expiration,
        from: sendEmailResult.from,
        to: sendEmailResult.to,
      };

      return res.status(response.code).json(response).end();
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  fbAdmin
    .auth()
    .verifyIdToken(firebaseToken)
    .then(async (decoded) => {
      if (decoded) {
        const ava = decoded.picture;
        try {
          const data = {
            email,
            name,
            password,
            ava,
          };
          const user = await User.createUser(data);
          const response = {
            code: httpStatus.CREATED,
            message: "Successfully created new account",
            data: {
              user,
            },
          };

          return res.status(response.code).json(response).end();
        } catch (error) {
          return next(error);
        }
      }
    })
    .catch(async (error) => {
      if (error.code === "auth/argument-error") {
        const response = {
          code: httpStatus.BAD_REQUEST,
          message: "Wrong provider authentication token",
        };

        return res.status(response.code).json(response).end();
      }
    });
};

module.exports.signupDev = async (req, res, next) => {
  const { db } = req.app.locals;
  const { User } = new Model({ db });

  try {
    const existedEmail = await User.getUserByEmail(req.body.email);
    if (existedEmail) {
      return res
        .status(httpStatus.CONFLICT)
        .json({
          code: httpStatus.CONFLICT,
          message: "This email is already taken, choose another email",
        })
        .end();
    }

    const existedName = await User.getUserByName(req.body.name);
    if (existedName) {
      return res
        .status(httpStatus.CONFLICT)
        .json({
          code: httpStatus.CONFLICT,
          message: "This name is already taken, choose another name",
        })
        .end();
    }

    const newUser = await User.createUser(req.body);

    return res
      .status(httpStatus.CREATED)
      .json({
        code: httpStatus.CREATED,
        message: "Created new user",
        newUser: User.transform(newUser),
      })
      .end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.signupVerify = async (req, res, next) => {
  const { db } = req.app.locals;
  const { User, Token } = new Model({ db });

  const name = _.get(req.query, "name", "");
  const token = _.get(req.query, "token", "");

  const payload = Token.decodeToken(token);
  const email = payload.data.email;
  const password = payload.data.password;

  try {
    const failedRedirect = feDomain + `/verify-email/error?email=${email}`;
    const isTokenValid = Token.verifyToken(token);
    const isAccountCreated = await User.getUserByEmail(email);

    if (!isTokenValid || isAccountCreated) {
      return res.status(httpStatus.FOUND).redirect(failedRedirect);
    }
  } catch (error) {
    return next(error);
  }

  try {
    const successfullRedirect = "http://localhost:4000";
    // const successfullRedirect =
    //   env === EnvHostingEnum.PRODUCTION
    //     ? "https://vstay.page.link/verified"
    //     : feDomain + `/verify-email/success?email=${email}`;
    const newUser = {
      email,
      password,
      name,
    };
    const user = await User.createUser(newUser);
    console.log(user);
    return res.status(httpStatus.FOUND).redirect(successfullRedirect);
  } catch (error) {
    next(error);
  }
};

module.exports.signin = async (req, res, next) => {
  const { db } = req.app.locals;
  const { Token } = new Model({ db });

  const user = req.middleware.user;
  const rememberMe = _.get(req.query, "remember-me", false);
  const rememberMeRefreshTokenExpiration = 24 * 7;
  const useragent = getUserAgent(req);

  try {
    const { accessToken, refreshToken, firebaseToken } = await Promise.all([
      Token.generateToken({
        payload: user._id,
        expiresIn: parseInt(accessTokenExpiration),
        expiresUnit: "minute",
      }),
      Token.updateOrCreateTokenByUserId(user._id, {
        payload: {
          user,
          agent: useragent,
        },
        expiresIn: rememberMe
          ? rememberMeRefreshTokenExpiration
          : parseInt(refreshTokenExpiration),
      }),
      fbAdmin.auth().createCustomToken(`${user._id}`),
    ]).then((promises) => ({
      accessToken: promises[0],
      refreshToken: promises[1],
      firebaseToken: promises[2],
    }));

    const response = {
      code: httpStatus.OK,
      message: "OK",
      accessToken: {
        value: "Bearer " + accessToken.token,
        iat: accessToken.iat,
        exp: accessToken.exp,
      },
      refreshToken: {
        value: "Bearer " + refreshToken.value,
        iat: refreshToken.iat,
        exp: refreshToken.exp,
      },
      firebaseToken,
      user: {
        _id: user._id,
        status: user.status,
        role: user.role,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    };

    return res.status(response.code).json(response).end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.refreshToken = async (req, res, next) => {
  const { db } = req.app.locals;
  const { Token } = new Model({ db });
  const token = _.get(req.headers, "x-refresh-token", "");
  const refreshTokenValue = token.slice(7, token.length);
  try {
    if (Token.verifyToken(refreshTokenValue) === false) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({
          code: httpStatus.UNAUTHORIZED,
          message: "Unauthorized",
        })
        .end();
    }

    const refreshToken = await Token.getTokenByValue(refreshTokenValue);
    if (!refreshToken) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({
          code: httpStatus.NOT_FOUND,
          message: "No token found",
        })
        .end();
    }

    const newAccessToken = await Token.generateToken({
      payload: refreshToken.userId,
      expiresIn: parseInt(accessTokenExpiration),
      expiresUnit: "minute",
    });

    return res
      .status(httpStatus.CREATED)
      .json({
        code: httpStatus.CREATED,
        message: "New access token is generated",
        accessToken: {
          value: "Bearer " + newAccessToken.token,
          iat: newAccessToken.iat,
          exp: newAccessToken.exp,
        },
        refreshToken: {
          value: "Bearer " + refreshToken.value,
          iat: refreshToken.iat,
          exp: refreshToken.exp,
        },
      })
      .end();
  } catch (error) {
    next(error);
  }
};
