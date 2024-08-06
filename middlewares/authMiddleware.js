require("dotenv").config();
const jwt = require("jsonwebtoken");
const { expressjwt: checkToken } = require("express-jwt");
const AppResponseDto = require("../dtos/responses/appResponseDto");

const User = require("../models/index").User;
const Role = require("../models/index").Role;

const readToken = (req, res, next) => {
  if (req.user != null) return next();

  const authorizationHeader = req.headers.authorization;
  if (
    authorizationHeader &&
    (authorizationHeader.startsWith("Bearer ") ||
      authorizationHeader.startsWith("Token "))
  ) {
    checkToken({
      secret: process.env.JWT_SECRET,
      algorithms: ["HS256"],
      requestProperty: "decodedJwt",
    })(req, res, (err) => {
      if (err) {
        console.error("JWT Error:", err);
        return res
          .status(401)
          .json(AppResponseDto.buildWithErrorMessages("Invalid token"));
      }
      next();
    });
  } else {
    console.log("No Authorization header found");
    return next();
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user == null)
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "Access denied, you are not logged in"
      )
    );

  if (req.user.roles.some((role) => role.name === "ROLE_ADMIN")) next();
  else
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "Access denied, you are not an Author"
      )
    );
};

const getFreshUser = (required) => {
  return async (req, res, next) => {
    if (!req.decodedJwt || !req.decodedJwt.userId) {
      if (required) {
        console.log("Permission denied: No decoded JWT or user ID");
        return res
          .status(401)
          .json(AppResponseDto.buildWithErrorMessages("Permission denied"));
      } else {
        return next();
      }
    }

    try {
      const user = await User.findOne({
        where: { id: req.decodedJwt.userId },
        include: [Role],
      });

      if (!user) {
        console.log("User not found");
        return res.status(401).send({ error: "Unauthorized" });
      } else {
        // console.log("User found", user);
        req.user = user;
        next();
      }
    } catch (err) {
      next(err);
    }
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
  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME || "30m",
  });
  console.log("Generated JWT:", token);
  return token;
};

exports.mustBeAuthenticated = [readToken, getFreshUser(true)];
exports.loadUser = [readToken, getFreshUser(false)];

exports.userOwnsItOrIsAdmin = (req, res, next) => {
  if (
    req.user != null &&
    (req.user.isAdminSync() || req.userOwnable.userId === req.user.id)
  ) {
    next();
  } else {
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "This resource does not belong to you"
      )
    );
  }
};

// TODO: replace by userOwnsItOrIsOnly
exports.ownsCommentOrIsAdmin = (req, res, next) => {
  if (
    req.user != null &&
    (req.user.roles.some((role) => role.name === "ROLE_ADMIN") ||
      req.comment.userId === req.user.id)
  ) {
    next();
  } else {
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "This comment does not belong to you"
      )
    );
  }
};
