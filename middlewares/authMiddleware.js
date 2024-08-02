require("dotenv").config();
const jwt = require("jsonwebtoken");
const { expressjwt: checkToken } = require("express-jwt"); // Updated import
const AppResponseDto = require("../dtos/responses/appResponseDto");

const User = require("../models/index").User;
const Role = require("../models/index").Role;

const readToken = function (req, res, next) {
  if (req.user != null) return next();

  if (
    (req.hasOwnProperty("headers") &&
      req.headers.hasOwnProperty("authorization") &&
      req.headers.authorization.split(" ")[0] === "Bearer") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token")
  ) {
    checkToken({
      secret: process.env.JWT_SECRET || "JWT_SUPER_SECRET",
      algorithms: ["HS256"],
      userProperty: "decodedJwt",
    })(req, res, next);
  } else {
    return next();
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user === null)
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "Access denied, you re not Logged In"
      )
    );

  if (req.user.roles.some((role) => role.name === "ROLE_ADMIN")) next();
  else
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "Access denied, you re not an Author"
      )
    );
};

const getFreshUser = (required) => {
  return (req, res, next) => {
    if (req.decodedJwt == null || req.decodedJwt.userId == null) {
      if (required)
        return res.json(
          AppResponseDto.buildWithErrorMessages("Permission denied")
        );
      else return next();
    }
    User.findOne({
      where: { id: req.decodedJwt.userId },
      include: [Role],
    })
      .then((user) => {
        if (!user) {
          res.status(401).send({ error: "Unauthorized" });
        } else {
          req.user = user;
          next();
        }
      })
      .catch((err) => {
        next(err);
      });
  };
};

exports.isAuthenticated = (req, res, next) => {
  if (req.user != null) {
    next();
    return;
  }
  return res.json(
    AppResponseDto.buildWithErrorMessages(
      "Permission denied, you must be authenticated"
    )
  );
};

exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "JWT_SUPER_SECRET", {
    expiresIn: process.env.JWT_EXPIRE_TIME || 30000,
  });
};

exports.mustBeAuthenticated = [readToken, getFreshUser(true)];
exports.loadUser = [readToken, getFreshUser(false)];

exports.userOwnsItOrIsAdmin = (req, res, next) => {
  if (
    req.user != null &&
    (req.user.isAdminSync() || req.userOwnable.userId === req.user.id)
  )
    next();
  else
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "This resource does not belong to you"
      )
    );
};

// TODO: replace by userOwnsItOrIsOnly
exports.ownsCommentOrIsAdmin = (req, res, next) => {
  if (
    req.user != null &&
    (req.user.roles.some((role) => role.name === "ROLE_ADMIN") ||
      req.comment.userId === req.user.id)
  )
    next();
  else
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "This comment does not belong to you"
      )
    );
};
