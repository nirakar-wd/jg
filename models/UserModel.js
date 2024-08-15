require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TEXT } = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  const { INTEGER, STRING, DATE, UUID, UUIDV4, TEXT } = DataTypes;

  const User = sequelize.define(
    "users",
    {
      id: {
        type: INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      bio: {
        type: STRING(255),
        allowNull: true,
        field: "bio",
      },
      firstName: {
        type: STRING(50),
        allowNull: false,
        field: "first_name",
      },
      lastName: {
        type: STRING(50),
        allowNull: false,
        field: "last_name",
      },
      username: {
        type: STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: STRING(100),
        allowNull: false,
      },
      email: {
        type: STRING(50),
        allowNull: true,
      },
      phone: {
        type: STRING(15),
        allowNull: true,
      },
      createdAt: {
        type: DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "created_at",
      },
      updatedAt: {
        type: DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "updated_at",
      },
    },
    {
      tableName: "users",

      hooks: {
        beforeCreate: async (user, options) => {
          user.password = await bcrypt.hash(user.password, 10);
        },
      },
    }
  );

  User.associate = function (models) {
    User.hasMany(models.Order);

    // here is how we add defaultScope programmatically
    User.addScope(
      "defaultScope",
      {
        include: [
          {
            required: false,
            model: models.UserImage,
            as: "images",
            attributes: ["id", "filePath"],
          },
        ],
      },
      {
        // defaultScope already exists, to avoid the error pass override
        override: true,
      }
    );

    User.belongsToMany(models.Role, {
      through: "users_roles",
      foreignKey: "userId",
      otherKey: "roleId",
    });

    User.hasMany(models.Comment);
    User.hasMany(models.Feedback);
    User.hasMany(models.Address);
    User.hasMany(models.UserImage, { as: "images" });
    // console.log(models);
  };

  User.beforeBulkUpdate((user) => {
    user.attributes.updateTime = new Date();
    return user;
  });

  User.prototype.isAdminSync = function () {
    return (
      this.roles != null &&
      this.roles.some((role) => role.name === "ROLE_ADMIN")
    );
  };

  User.prototype.isAdminAsync = async function () {
    let isAdmin = false;
    await this.getRoles()
      .then((roles) => {
        isAdmin = roles.some((r) => r.name === "ROLE_ADMIN");
      })
      .catch((err) => {
        console.error(err);
      });

    return isAdmin;
  };

  User.prototype.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  User.prototype.generateJwt = function () {
    return jwt.sign(
      {
        userId: this.id,
        username: this.username,
        roles: this.roles ? this.roles.map((role) => role.name) : [],
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRE_TIME || "1h" }
    );
  };

  return User;
};
