"use strict";

const { faker } = require("@faker-js/faker");
const { Payment, Order, sequelize } = require("./../models/index");
const { PAYMENT_STATUS } = require("../constants");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const [payments, orders] = await Promise.all([
        Payment.findAll({ attributes: ["id"] }),
        Order.findAll({ attributes: ["id"] }),
      ]);

      const paymentsCount = payments.length;
      let paymentsToSeed = 42 - paymentsCount; // Adjust the number as needed

      const paymentPromises = [];
      for (let i = 0; i < paymentsToSeed; i++) {
        const order = orders[Math.floor(Math.random() * orders.length)];
        const statusKeys = Object.keys(PAYMENT_STATUS);
        const randomStatus =
          PAYMENT_STATUS[
            statusKeys[Math.floor(Math.random() * statusKeys.length)]
          ].ordinal;

        paymentPromises.push(
          Payment.create({
            orderId: order.id,
            paymentAmount: faker.number.float({
              min: 10,
              max: 1000,
              precision: 0.01,
            }),
            paymentMethod: faker.finance.creditCardIssuer(),
            paymentStatus: randomStatus,
            transactionId: faker.datatype.uuid(),
          })
        );
      }

      await Promise.all(paymentPromises);
      console.log("[+] Seeded payments");
    } catch (err) {
      console.error("Error seeding data:", err);
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await sequelize.transaction(async (t) => {
        await Payment.destroy({
          where: {},
          transaction: t,
        });
        console.log("Payments deleted successfully");
      });
    } catch (err) {
      console.error("Error deleting payments:", err);
      throw err;
    }
  },
};
