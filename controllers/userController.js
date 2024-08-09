require("dotenv").config();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { User, Role, Sequelize } = require("../models/index");
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
      sameSite: "none",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
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
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
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

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
};
