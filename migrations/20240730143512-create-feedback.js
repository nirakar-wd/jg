"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("feedbacks", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: "users",
            key: "id",
          },
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      })
      // .then(() => {
      //   // Optionally, you can add an index on the foreign key
      //   return queryInterface.addIndex("feedbacks", ["userId"]);
      // });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("feedbacks");
  },
};
