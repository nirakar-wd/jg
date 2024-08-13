require("dotenv").config();
const jwt = require("jsonwebtoken");
// const { expressjwt: checkToken } = require("express-jwt");
const AppResponseDto = require("../dtos/responses/appResponseDto");

const User = require("../models/index").User;
const Role = require("../models/index").Role;

const verifyToken = async (req, res, next) => {
  const { accessToken } = req.cookies;

  console.log(req.cookies);

  if (!accessToken) {
    return res.status(401).send("Not Authorized, no token");
  }

  jwt.verify(accessToken, process.env.JWT_SECRET, async (err, decodedUser) => {
    if (err) {
      return res.status(401).send("Not Authorized, invalid token");
    }
    const foundUser = await User.findOne({
      where: { id: decodedUser.id },
      include: [{ model: Role, attributes: ["name"] }],
    });

    // console.log(foundUser);
    if (!foundUser) {
      return res.status(401).send("Unauthorized! User not found");
    }
    req.user = foundUser;
    next();
  });
};

const generateAccessToken = ({ id, username, email }) => {
  const accessToken = jwt.sign(
    { id, username, email },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
  return {
    accessToken,
  };
};

const generateRefreshToken = ({ id, username, email }) => {
  const refreshToken = jwt.sign(
    { id, username, email },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
  return {
    refreshToken,
  };
};

const isAdmin = (req, res, next) => {
  if (req.user == null) {
    return res.status(403).json({
      message: "Access denied, you are not logged in",
    });
  }

  // Check if roles exist and are an array
  if (req.user.roles && Array.isArray(req.user.roles)) {
    // Use `some` to check if any role has the name 'ROLE_ADMIN'
    const hasAdminRole = req.user.roles.some(
      (role) => role.dataValues && role.dataValues.name === "ROLE_ADMIN"
    );

    if (hasAdminRole) {
      return next();
    }
  }

  return res.status(403).json({
    message: "Access denied, you are not an Admin",
  });
};

// const getFreshUser = (required) => {
//   return async (req, res, next) => {
//     if (!req.decodedJwt || !req.decodedJwt.userId) {
//       if (required) {
//         console.log("Permission denied: No decoded JWT or user ID");
//         return res
//           .status(401)
//           .json(AppResponseDto.buildWithErrorMessages("Permission denied"));
//       } else {
//         return next();
//       }
//     }

//     try {
//       const user = await User.findOne({
//         where: { id: req.decodedJwt.userId },
//         include: [Role],
//       });

//       if (!user) {
//         console.log("User not found");
//         return res.status(401).send({ error: "Unauthorized" });
//       } else {
//         // console.log("User found", user);
//         req.user = user;
//         next();
//       }
//     } catch (err) {
//       next(err);
//     }
//   };
// };

// exports.isAuthenticated = (req, res, next) => {
//   if (req.user != null) {
//     next();
//     return;
//   }
//   return res.json(
//     AppResponseDto.buildWithErrorMessages(
//       "Permission denied, you must be authenticated"
//     )
//   );
// };

// exports.signToken = (id) => {
//   const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE_TIME || "30m",
//   });
//   console.log("Generated JWT:", token);
//   return token;
// };

// exports.mustBeAuthenticated = [verifyToken, getFreshUser(true)];
// exports.loadUser = [readToken, getFreshUser(false)];

// exports.userOwnsItOrIsAdmin = (req, res, next) => {
//   if (
//     req.user != null &&
//     (req.user.isAdminSync() || req.userOwnable.userId === req.user.id)
//   ) {
//     next();
//   } else {
//     return res.json(
//       AppResponseDto.buildWithErrorMessages(
//         "This resource does not belong to you"
//       )
//     );
//   }
// };

const userOwnsItOrIsAdmin = (req, res, next) => {
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

// // TODO: replace by userOwnsItOrIsOnly
// exports.ownsCommentOrIsAdmin = (req, res, next) => {
//   if (
//     req.user != null &&
//     (req.user.roles.some((role) => role.name === "ROLE_ADMIN") ||
//       req.comment.userId === req.user.id)
//   ) {
//     next();
//   } else {
//     return res.json(
//       AppResponseDto.buildWithErrorMessages(
//         "This comment does not belong to you"
//       )
//     );
//   }
// };

const ownsCommentOrIsAdmin = (req, res, next) => {
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

module.exports = {
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  userOwnsItOrIsAdmin,
  ownsCommentOrIsAdmin,
  isAdmin,
};
