"use strict";

const { faker } = require("@faker-js/faker");
const {
  Order,
  OrderItem,
  User,
  Product,
  Address,
  sequelize,
} = require("./../models/index");
const ORDER_STATUS = require("../constants").ORDER_STATUS;
const _ = require("lodash");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Find existing orders
      const existingOrders = await Order.findAll({ attributes: ["id"] });
      const ordersCount = existingOrders.length;
      let ordersToSeed = 30 - ordersCount;

      if (ordersToSeed > 0) {
        // Fetch required data for seeding
        const [users, addresses, products] = await Promise.all([
          User.findAll({
            attributes: ["id"],
            include: [{ model: Address, attributes: ["id", "userId"] }],
          }),
          Address.findAll({ attributes: ["id", "userId"] }),
          Product.findAll({ attributes: ["id", "name", "slug", "price"] }),
        ]);

        const guestAddresses = addresses.filter((a) => a.userId == null);

        const orderPromises = [];
        for (let i = 0; i < ordersToSeed; i++) {
          const order = {
            trackingNumber: faker.string.alphanumeric(16), // Updated method
            orderStatus: _.sample(ORDER_STATUS).ordinal,
          };

          let user = users[Math.floor(Math.random() * users.length)];
          if (user.addresses.length > 0 && faker.datatype.boolean()) {
            order.userId = user.id;
            order.total = faker.number.int({ min: 100, max: 100000 }),
            order.addressId =
              user.addresses[
                Math.floor(Math.random() * user.addresses.length)
              ].id;
          } else {
            order.addressId =
              guestAddresses[
                Math.floor(Math.random() * guestAddresses.length)
              ].id;
          }

          orderPromises.push(Order.create(order));
        }

        const orders = await Promise.all(orderPromises);

        const orderItemPromises = [];
        for (let order of orders) {
          const orderItemsToSeed = faker.number.int({ min: 1, max: 12 });
          for (let j = 0; j < orderItemsToSeed; j++) {
            const product =
              products[Math.floor(Math.random() * products.length)];
            orderItemPromises.push(
              OrderItem.create({
                name: product.name,
                slug: product.slug,
                userId: order.userId,
                orderId: order.id,
                productId: product.id,
                price: Math.min(10, product.price - faker.number.int({min: -50, max: 50})),
                quantity: faker.number.int({ min: 1, max: 10 }),
              })
            );
          }
        }

        await Promise.all(orderItemPromises);

        console.log("[+] Seeded orders and order items");
      }
    } catch (err) {
      console.error("Error seeding data:", err);
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await sequelize.transaction(async (t) => {
        // Delete order items first to avoid foreign key constraint issues
        await OrderItem.destroy({ where: {}, transaction: t });
        await Order.destroy({ where: {}, transaction: t });

        console.log("[+] Deleted seeded orders and order items");
      });
    } catch (err) {
      console.error("Error deleting seeded data:", err);
      throw err;
    }
  },
};
