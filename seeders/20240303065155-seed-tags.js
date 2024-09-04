"use strict";

const { faker } = require('@faker-js/faker');
const { Tag } = require("./../models/index");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await Promise.all([
        Tag.findOrCreate({
          where: { name: "jeans" },
          defaults: { description: "Jeans or the like" },
        }),
        Tag.findOrCreate({
          where: { name: "shoes" },
          defaults: { description: "Shoes of any kind" },
        }),
        Tag.findOrCreate({
          where: { name: "jackets" },
          defaults: { description: "Jackets against the cold" },
        }),
      ]);
      console.log("[+] Tags seeded successfully");
    } catch (err) {
      console.error("Error seeding tags:", err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await Tag.destroy({
        where: {
          name: ["jeans", "shoes", "jackets"],
        },
      });
      console.log("Tags deleted successfully");
    } catch (err) {
      console.error("Error deleting tags:", err);
    }
  },
};
