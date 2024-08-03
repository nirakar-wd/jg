"use strict";
const { faker } = require("@faker-js/faker");
const { Product, Tag, Category, sequelize } = require("./../models/index");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await sequelize.transaction(async (t) => {
        const [productCount, tags, categories] = await Promise.all([
          Product.count(),
          Tag.findAll(),
          Category.findAll(),
        ]);

        let productsToSeed = 42 - productCount;
        const productPromises = [];

        for (let i = 0; i < productsToSeed; i++) {
          productPromises.push(
            Product.create(
              {
                name:
                  faker.commerce.productName() +
                  faker.number.int({ min: 0, max: 120 }), // Updated method
                description: faker.lorem.sentences(2),
                price: parseInt(faker.commerce.price(10, 1000, 2)) * 100,
                stock: faker.number.int({ min: 0, max: 120 }), // Updated method
              },
              { transaction: t }
            )
          );
        }

        const products = await Promise.all(productPromises);
        console.log(`[+] ${products.length} Products seeded`);

        const associationPromises = [];
        for (const product of products) {
          const tag = tags[Math.floor(Math.random() * tags.length)];
          const category =
            categories[Math.floor(Math.random() * categories.length)];
          associationPromises.push(product.setTags([tag], { transaction: t }));
          associationPromises.push(
            product.setCategories([category], { transaction: t })
          );
        }

        await Promise.all(associationPromises);
        console.log("[+] Done");
      });
    } catch (err) {
      console.error("Error seeding data:", err);
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await sequelize.transaction(async (t) => {
        await Product.destroy({
          where: {},
          transaction: t,
        });
        console.log("Products deleted successfully");
      });
    } catch (err) {
      console.error("Error deleting products:", err);
      throw err;
    }
  },
};
