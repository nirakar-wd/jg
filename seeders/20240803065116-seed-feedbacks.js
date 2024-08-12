"use strict";

const { faker } = require("@faker-js/faker");
const { Feedback, User, sequelize } = require("./../models/index");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Fetch existing Feedback, User, and Product records
      const [feedbacks, users, products] = await Promise.all([
        Feedback.findAll({ attributes: ["id"] }),
        User.findAll({ attributes: ["id"] }),
      ]);

      const feedbacksCount = feedbacks.length;
      let feedbacksToSeed = 42 - feedbacksCount; // Adjust the number as needed

      const feedbackPromises = [];
      for (let i = 0; i < feedbacksToSeed; i++) {
        const user = users[Math.floor(Math.random() * users.length)];

        feedbackPromises.push(
          Feedback.create({
            content: faker.lorem.sentence(),
            userId: user.id,
          })
        );
      }

      await Promise.all(feedbackPromises);
      console.log("[+] Seeded feedbacks");
    } catch (err) {
      console.error("Error seeding data:", err);
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await sequelize.transaction(async (t) => {
        await Feedback.destroy({
          where: {},
          transaction: t,
        });
        console.log("Feedbacks deleted successfully");
      });
    } catch (err) {
      console.error("Error deleting feedbacks:", err);
      throw err;
    }
  },
};
