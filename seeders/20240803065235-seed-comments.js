"use strict";

const { faker } = require("@faker-js/faker");
const { Comment, User, Product, sequelize } = require("./../models/index");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const [comments, users, products] = await Promise.all([
        Comment.findAll({ attributes: ["id"] }),
        User.findAll({ attributes: ["id"] }),
        Product.findAll({ attributes: ["id"] }),
      ]);

      const commentsCount = comments.length;
      let commentsToSeed = 42 - commentsCount;

      const commentPromises = [];
      for (let i = 0; i < commentsToSeed; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        commentPromises.push(
          Comment.create({
            content: faker.lorem.sentence(),
            userId: user.id,
            productId: product.id,
            rating: faker.number.int({ min: 1, max: 5 }), // Updated method
          })
        );
      }

      await Promise.all(commentPromises);
      console.log("[+] Seeded comments");
    } catch (err) {
      console.error("Error seeding data:", err);
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await sequelize.transaction(async (t) => {
        await Comment.destroy({
          where: {},
          transaction: t,
        });
        console.log("Comments deleted successfully");
      });
    } catch (err) {
      console.error("Error deleting comments:", err);
      throw err;
    }
  },
};
