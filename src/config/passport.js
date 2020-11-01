const passportJwt = require("passport-jwt");

const { secretOrPrivateKey } = require("./vars");

const JwtStrategy = passportJwt.Strategy;

const ExtractJwt = passportJwt.ExtractJwt;

const Model = require("../api/models");

module.exports.jwt = (passport) => {
  const { value } = secretOrPrivateKey;

  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: value,
    passReqToCallback: true,
  };

  passport.use(
    new JwtStrategy(jwtOptions, async function (req, payload, next) {
      const { db } = req.app.locals;
      const { User } = new Model({ db });

      try {
        const user = await User.getUserById(payload.data);
        if (!user) {
          return next(null, false);
        }

        return next(null, user);
      } catch (error) {
        return next(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

module.exports.extractJwt = async (req) => {
  if (!req.headers.authorization) {
    return null;
  }

  const jwt = require("jsonwebtoken");

  const { value } = secretOrPrivateKey;

  const { db } = req.app.locals;
  const { User } = new Model({ db });
  const token =
    req.headers.authorization && req.headers.authorization.includes("Bearer")
      ? req.headers.authorization.slice(7, req.headers.authorization.length)
      : "";

  if (!token) {
    return null;
  }

  const decoded = await jwt.verify(token, value);

  try {
    const user = await User.getUserById(decoded.data);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    throw Error(error);
  }
};
