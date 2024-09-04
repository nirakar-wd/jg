"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("products_collections", {
        productId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "products", // Ensure this matches the exact name of the table in your database
            key: "id",
          },
          field: "productId",
          onUpdate: "cascade",
          onDelete: "cascade",
        },
        collectionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "collections", // Ensure this matches the exact name of the table in your database
            key: "id",
          },
          field: "collectionId",
          onUpdate: "cascade",
          onDelete: "cascade",
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          field: "created_at",
        },
      })
      .then(() => {
        // Adding composite primary key
        return queryInterface.addConstraint("products_collections", {
          fields: ["productId", "collectionId"],
          type: "primary key",
          name: "products_collections_pkey", // Custom name for the primary key constraint
        });
      });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("products_collections");
  },
};
