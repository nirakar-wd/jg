"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("payments", {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          field: "userId",
          references: {
            model: "users", // Assuming there is a 'users' table
            key: "id",
          },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        orderId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: "orderId",
          references: {
            model: "orders", // Assuming there is an 'orders' table
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        payment_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        payment_method: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        payment_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        transaction_id: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
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
        // Adding indexes
        return Promise.all([
          queryInterface.addIndex("payments", ["userId"]),
          queryInterface.addIndex("payments", ["orderId"]),
          queryInterface.addIndex("payments", ["transaction_id"]),
        ]);
      });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("payments");
  },
};
