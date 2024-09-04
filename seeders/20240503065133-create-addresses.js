"use strict";

const { faker } = require('@faker-js/faker');
const { Address, User } = require("./../models/index");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const [addressCount, users] = await Promise.all([
        Address.count(),
        User.findAll({ include: [{ model: Address }] }),
      ]);

      let addressesToSeed = 53 - addressCount;

      if (addressesToSeed > 0) {
        const promises = [];
        for (let i = 0; i < addressesToSeed; i++) {
          const address = {
            address: faker.address.streetAddress(true),
            country: faker.address.country(),
            city: faker.address.city(),
            state: faker.address.state(),
            zipCode: faker.address.zipCode(),
          };
          const user = users[Math.floor(Math.random() * users.length)];

          if (faker.datatype.boolean() || faker.datatype.boolean()) {
            address.userId = user.id;
            address.firstName = user.firstName;
            address.lastName = user.lastName;
          } else {
            address.firstName = faker.person.firstName();
            address.lastName = faker.person.lastName();
          }

          promises.push(Address.create(address));
        }

        const createdAddresses = await Promise.all(promises);
        console.log(`[+] ${createdAddresses.length} Addresses seeded`);
      } else {
        console.log("[+] No addresses to seed");
      }
    } catch (err) {
      console.error("Error seeding addresses:", err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await Address.destroy({
        where: {},
        truncate: true,
        cascade: true,
      });
      console.log("All addresses deleted successfully");
    } catch (err) {
      console.error("Error deleting addresses:", err);
    }
  },
};
