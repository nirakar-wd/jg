"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_images", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER, // Ensure this matches the type of 'id' in the 'users' table
        allowNull: true,
        field: "userId",
        references: {
          model: "users", // Assumes there is a `users` table
          key: "id",
        },
        onDelete: "CASCADE",
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "file_name",
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "file_path",
      },
      originalName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "original_name",
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "file_size",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_images");
  },
};
