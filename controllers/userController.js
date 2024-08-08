require("dotenv").config();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { User, Role, Sequelize } = require("../models/index");
const { Op } = Sequelize;
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

    console.log(resultBinding);
    const newUser = await User.create(resultBinding.validatedData);
    if (!newUser) {
      throw new Error("User creation failed");
    }

    // Generate access token
    const accessToken = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set tokens as HTTP-only cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
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
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15m" } // Access token is valid for 15 minutes
      );

      // Generate the refresh token (long-lived)
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Refresh token is valid for 7 days
      );

      // Set cookies for both tokens
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refresh_token", refreshToken, {
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
  const refreshToken = req.cookies.refresh_token;

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
