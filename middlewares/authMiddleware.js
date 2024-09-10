require("dotenv").config();
const jwt = require("jsonwebtoken");
const AppResponseDto = require("../dtos/responses/appResponseDto");
const User = require("../models/index").User;
const Order = require("../models/index").Order;
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
      expiresIn: "1d",
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

const userOwnsItOrIsAdmin = async (req, res, next) => {
    const userId = req.user.id;
    const orderId = req.params.orderId;
  
    try {
      // Find the order by ID
      const order = await Order.findOne({ where: { id: orderId } });
  
      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }
  
      // Check if the user is the owner of the order or an admin
      if (order.userId === userId || req.user.roles.some((role) => role.name === "ROLE_ADMIN")) {
        return next(); // User is authorized to access the order
      }
  
      // If not, deny access
      return res.status(403).json({ message: "Access denied." });
    } catch (error) {
      console.error("Error checking ownership or admin status:", error);
      return res.status(500).json({ message: "Internal server error." });
    
  }
};

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
