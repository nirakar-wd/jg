"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("product_images", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      productId: {
        type: Sequelize.STRING,
        allowNull: true,
        field: "productId",
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: "created_at",
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: "updated_at",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("product_images");
  },
};
