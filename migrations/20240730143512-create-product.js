"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("products", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false, // Optional: Ensures that the name is required
        },
        slug: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false, // Optional: Ensures that the slug is required
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true, // Optional: You might want to allow null descriptions
        },
        price: {
          type: Sequelize.INTEGER,
          allowNull: false, // Optional: Ensures that the price is required
        },
        stock: {
          type: Sequelize.INTEGER,
          allowNull: false, // Optional: Ensures that the stock is required
        },
        vendor: {
          type: Sequelize.STRING,
          allowNull: true, 
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
      })
      .then(() => {
        return queryInterface.addIndex("products", {
          fields: ["created_at"],
        });
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("products");
  },
};
