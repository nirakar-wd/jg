const _ = require("lodash");
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

    res.json(UserResponseDto.registerDto(newUser));
  } catch (err) {
    return res.status(400).send(AppResponseDto.buildWithErrorMessages(err));
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
      req.user = user;
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
