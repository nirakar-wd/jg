"use strict";
require("dotenv").config();
const bcrypt = require("bcrypt");
const { User, Role, UserRole } = require("./../models/index");

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const [role, createdRole] = await Role.findOrCreate({
        where: { name: "ROLE_ADMIN" },
        defaults: { description: "For Admin users" },
      });

      const [user, createdUser] = await User.findOrCreate({
        where: { username: "admin" },
        include: [Role],
        defaults: {
          firstName: process.env.ADMIN_FNAME || "admin",
          lastName: process.env.ADMIN_LNAME || "admin",
          email: process.env.ADMIN_EMAIL || "admin@admin.com",
          password: "password",
        },
      });

      const roles = await user.getRoles();

      if (!roles.some((r) => r.name === "ROLE_ADMIN")) {
        await user.addRole(role);
        console.log("[+] associated ROLE_ADMIN to admin");
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  },

  down: async (queryInterface, Sequelize) =>  {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    try {
      await User.destroy({
        where: {
          username: "admin",
        },
      });
      console.log("Admin deleted successfully");
    } catch (err) {
      console.error(err);
    }
  },
};
