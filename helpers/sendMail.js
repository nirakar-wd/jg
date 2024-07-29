require("dotenv").config();
const nodemailer = require("nodemailer");
const helpers = require("./index");

const SendEmail = (req, res, next) => {
  try {
    const eAuth = {
      user: process.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    };
    // console.log(auth)
    const userEmail = req.body.user_email;
    const emailSubject = req.body.email_subject;
    const emailContent = req.body.email_content;

    var smtpTransport = nodemailer.createTransport({
      service: "Gmail",
      auth: eAuth,
    });
    var mailOptions = {
      to: userEmail,
      from: "no-reply@gmail.com",
      subject: emailSubject,
      html: emailContent,
    };

    smtpTransport.sendMail(mailOptions, function (err) {
      if (err) {
        helpers.customErrorResponse(res, 404, `${err}`);
      }
      req.body.object = "users";
      req.body.action = "send email";
      req.body.message = `Registration successful, to activate your account please verify through the link we sent to the email address ${userEmail}`;
      delete req.body.email_content;

      next();
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = SendEmail;
