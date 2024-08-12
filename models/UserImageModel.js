const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const UserImage = sequelize.define(
    "user_images",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "userId",
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "file_name",
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "file_path",
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "original_name",
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "file_size",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "updated_at",
      },
    },
    {
      tableName: "file_uploads",
      defaultScope: {
        where: {
          userId: {
            [Op.ne]: null,
          },
        },
      },
    }
  );

  UserImage.associate = (models) => {
    UserImage.belongsTo(models.User, { onDelete: "cascade" });
  };

  return UserImage;
};
