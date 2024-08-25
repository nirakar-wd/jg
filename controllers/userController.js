require("dotenv").config();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { User, Role, Address, Feedback, Sequelize } = require("../models/index");
const { Op } = Sequelize;
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/authMiddleware");

const UserResponseDto = require("../dtos/responses/usersDto");
const UserRequestDto = require("../dtos/requests/usersDto");
const AppResponseDto = require("../dtos/responses/appResponseDto");

exports.register = async (req, res) => {
  try {
    const body = req.body;
    const resultBinding = UserRequestDto.createUserRequestDto(req.body);

    if (!_.isEmpty(resultBinding.errors)) {
      return res
        .status(422)
        .json(AppResponseDto.buildWithErrorMessages(resultBinding.errors));
    }

    const { email, username } = resultBinding.validatedData;

    const user = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (user) {
      const errors = {};
      if (user.username === body.username) {
        errors.username = `username: ${body.username} is already taken`;
      }

      if (user.email === body.email) {
        errors.email = `Email: ${body.email} is already taken`;
      }
      if (user.phone === body.phone) {
        errors.email = `Email: ${body.phone} is already taken`;
      }

      if (!_.isEmpty(errors)) {
        return res
          .status(403)
          .json(AppResponseDto.buildWithErrorMessages(errors));
      }
    }

    const newUser = await User.create(resultBinding.validatedData);
    if (!newUser) {
      throw new Error("User creation failed");
    }

    // Generate access token
    const { accessToken } = generateAccessToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    // // Generate refresh token
    const { refreshToken } = generateRefreshToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    // Set tokens as HTTP-only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 60 * 60 * 1000, // 1hr
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json(UserResponseDto.registerDto(newUser));
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ error: "You need a username and password" });
  }

  try {
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Role,
          attributes: ["name"],
        },
      ],
    });

    if (user && user.isValidPassword(password)) {
      // Generate access token
      const { accessToken } = generateAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      // // Generate refresh token
      const { refreshToken } = generateRefreshToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      // Set cookies for both tokens
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 60 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json(UserResponseDto.loginSuccess(user));
    } else {
      return res
        .status(401)
        .json(AppResponseDto.buildWithErrorMessages("Invalid credentials"));
    }
  } catch (err) {
    return res.status(500).json(AppResponseDto.buildWithErrorMessages(err));
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ["password"] }, // Exclude the password field
      include: [{ model: Role, as: "roles" }],
    });

    res.json({
      success: true,
      count,
      users,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({
      message: "Failed to retrieve users",
      error,
    });
  }
};

// Get current user profile (assuming user ID is passed via JWT token or similar auth mechanism)
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log(userId);

    // Fetch the user by ID, including their roles (excluding the password)
    const user = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["password"] }, // Exclude the password
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["name"], // Include only the role name
        },
        {
          model: Address,
          as: "addresses", // Adjust the alias if needed based on your associations
          attributes: ["address", "city", "country", "state", "zipCode"], // Include the address fields you want
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error retrieving current user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve current user",
      error,
    });
  }
};

// Edit user
exports.editUser = async (req, res) => {
  try {
    const userId = req.userId; // Assume req.userId is set by authentication middleware
    const { firstName, lastName, profilePic, bio, email, password } = req.body;

    // Find the user by ID
    const user = await User.find({
      where: { id: userId }, // Exclude the password field
      include: [{ model: Role, as: "roles" }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profilePic) user.profilePic = profilePic;
    if (bio) user.bio = bio;
    if (email) user.email = email;

    // Handle password update with hashing
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Save the updated user
    await user.save();

    // Respond with the updated user (excluding the password)
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.profilePic,
        bio: user.bio,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).json({ message: "Failed to update user", error });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.userId;
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
};

// Post feedback
exports.createFeedback = async (req, res) => {
  const { content } = req.body;

  if (!content) {
      return res.status(400).json({ message: "message is required." });
  }

  try {
      // Create feedback
      const feedback = await Feedback.create({
          content: content,
          userId: req.user.id
      });

      res.status(201).json(feedback);
  } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback." });
  }
};
