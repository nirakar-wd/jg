"use strict";
const { Collection } = require("./../models/index");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await Promise.all([
        Collection.findOrCreate({
          where: { name: "summer" },
          defaults: { description: "Summer collection" },
        }),
        Collection.findOrCreate({
          where: { name: "spring" },
          defaults: { description: "Spring collection" },
        }),
        Collection.findOrCreate({
          where: { name: "winter" },
          defaults: { description: "Winter Collection" },
        }),
        Collection.findOrCreate({
          where: { name: "autumn" },
          defaults: { description: "Autumn Collection" },
        }),
      ]);
      console.log("[+] Collections seeded successfully");
    } catch (err) {
      console.error("Error seeding collections:", err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await Collection.destroy({
        where: {
          name: ["summer", "spring", "winter", "autumn"],
        },
      });
      console.log("Collections deleted successfully");
    } catch (err) {
      console.error("Error deleting collections:", err);
    }
  },
};
