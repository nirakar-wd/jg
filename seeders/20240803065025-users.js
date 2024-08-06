"use strict";
const { faker } = require("@faker-js/faker");
const { User, Role, UserRole } = require("./../models/index");

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const [userRole, roleCreated] = await Role.findOrCreate({
        where: { name: "ROLE_USER" },
        defaults: { description: "For Authenticated users" },
      });

      if (roleCreated) {
        console.log(`[+] 'ROLE_USER' role seeded successfully`);
      }

      const { count: userCount } = await User.findAndCountAll({
        attributes: ["id"],
        include: [
          {
            model: Role,
            where: { name: "ROLE_USER" },
            through: { attributes: [] },
          },
        ],
      });

      const usersToSeed = 36 - userCount;
      const promises = [];

      if (usersToSeed > 0) {
        console.log(`[+] Seeding ${usersToSeed} users`);
        for (let i = 0; i < usersToSeed; i++) {
          const fname = faker.person.firstName();
          const lname = faker.person.lastName();
          const user = await User.create({
            firstName: fname,
            lastName: lname,
            username: `${fname}_${lname}`,
            email: faker.internet.email(),
            password: "password",
            phone: faker.phone.number(),
          });
          promises.push(user.addRole(userRole));
        }
        await Promise.all(promises);
        console.log(`[+] Seeded ${usersToSeed} users`);
      } else {
        console.log("[+] No users to seed");
      }
    } catch (err) {
      console.error("Error seeding users:", err);
      process.exit(1);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await User.destroy({
        where: {},
        truncate: true,
        cascade: true,
      });
      console.log("All users deleted successfully");
    } catch (err) {
      console.error("Error deleting users:", err);
    }
  },
};
