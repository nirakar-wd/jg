const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userMiddleware = require("../helpers/users");
const { sendResponse } = require("../helpers/response");
const SendEmail = require("../helpers/sendMail");

router
  .route("/login")
  .post(userMiddleware.validateLogin, userController.login, sendResponse);

router
  .route("/sign-up")
  .post(
    userMiddleware.validateSignup,
    userController.signUp,
    SendEmail,
    sendResponse
  );
