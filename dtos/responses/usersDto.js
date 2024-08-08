const RolesDto = require("./rolesDto");

function registerDto(user) {
  return {
    success: true,
    full_messages: ["User registered successfully"],
  };
}

function loginSuccess(user) {
  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: RolesDto.toNameList(user.roles || []),
    },
  };
}

function buildOnlyForIdAndUsername(user) {
  if (user == null) return {};
  return {
    id: user.id,
    username: user.username,
  };
}

module.exports = {
  registerDto,
  loginSuccess,
  buildOnlyForIdAndUsername,
};
