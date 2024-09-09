require("dotenv").config();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const {
  User,
  Role,
  Address,
  Feedback,
  UserImage,
  Sequelize,
} = require("../models/index");

const { Op, fn, col, literal } = require("sequelize");

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
      maxAge: 24 * 60 * 60 * 1000, // 1 day
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
        maxAge: 24 * 60 * 60 * 1000, // 1 day
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
          attributes: ["id", "address", "city", "country", "state", "zipCode"], // Include the address fields you want
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
  console.log(req.files);
  console.log(req.body);
  try {
    const userId = req.params.userId;
    console.log(userId);
    const { firstName, lastName, bio, email, password, phone } = req.body;

    // Find the user by ID
    const user = await User.findOne({
      where: { id: userId },
      include: [
        { model: Role, as: "roles" },
        { model: UserImage, as: "images" },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.files && req.files.length > 0) {
      // Delete the existing images from the database
      await UserImage.destroy({ where: { userId: userId } });

      const filePromises = req.files.map((file) => {
        const filePath = file.path
          .replace(new RegExp("\\\\", "g"), "/")
          .replace("public", "");
        return UserImage.create({
          fileName: file.filename,
          filePath: filePath,
          originalName: file.originalname,
          fileSize: file.size,
          userId: userId,
        });
      });

      const uploadedImages = await Promise.all(filePromises);
      user.images = uploadedImages;
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;
    if (email) user.email = email;
    if (phone) user.phone = phone;

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
        phone: user.phone,
        bio: user.bio,
        email: user.email,
        images: user.images, // Include the images in the response
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
      userId: req.user.id,
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ message: "Failed to create feedback." });
  }
};

exports.getUserGrowthPercentage = async (req, res) => {
  try {
    // Fetch user counts per month for the past year
    const usersByMonth = await User.sequelize.query(
      `
      SELECT
        MONTH(created_at) AS month,
        YEAR(created_at) AS year,
        COUNT(id) AS userCount
      FROM
        users
      WHERE
        created_at >= NOW() - INTERVAL 1 YEAR
      GROUP BY
        YEAR(created_at), MONTH(created_at)
      ORDER BY
        YEAR(created_at), MONTH(created_at)
      `,
      {
        type: User.sequelize.QueryTypes.SELECT
      }
    );

    // Initialize an array to hold the monthly growth percentages
    const growthData = [];
    let previousMonthUserCount = null; // Initialize to null for the first comparison

    // Loop through each month's data and calculate growth
    usersByMonth.forEach((entry) => {
      const { month, year, userCount } = entry;
      const growth = previousMonthUserCount !== null
        ? Math.min(((userCount - previousMonthUserCount) / previousMonthUserCount) * 100, 100) // Cap growth at 100%
        : 0; // No growth for the first month

      growthData.push({
        month,
        year,
        userCount,
        growth: growth.toFixed(2), // Growth percentage with two decimal places
      });

      // Update previousMonthUserCount for the next iteration
      previousMonthUserCount = userCount;
    });

    // Return the result
    return res.status(200).json({
      success: true,
      growthData,
    });
  } catch (error) {
    console.error("Error calculating user growth:", error);
    return res.status(500).json({
      message: "Failed to calculate user growth",
      error: error.message,
    });
  }
};


