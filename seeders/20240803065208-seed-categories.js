"use strict";
const { Category } = require("./../models/index");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await Promise.all([
        Category.findOrCreate({
          where: { name: "kids" },
          defaults: { description: "Kids category" },
        }),
        Category.findOrCreate({
          where: { name: "teenagers" },
          defaults: { description: "Teenagers category" },
        }),
        Category.findOrCreate({
          where: { name: "adults" },
          defaults: { description: "Adults category" },
        }),
      ]);
      console.log("[+] Categories seeded successfully");
    } catch (err) {
      console.error("Error seeding categories:", err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await Category.destroy({
        where: {
          name: ["kids", "teenagers", "adults"],
        },
      });
      console.log("Categories deleted successfully");
    } catch (err) {
      console.error("Error deleting categories:", err);
    }
  },
};
