const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var async = require("async");

const Login = async (req, res, next) => {
  try {
    const loginEmail = req.body.login_email;
    const loginPassword = req.body.login_password;
    const loginAccountType = req.body.login_account_type;

    const [results] = await Promise.all([
      userModel.login(loginEmail, loginAccountType),
    ]);

    if (results.length <= 0) {
      helpers.customErrorResponse(
        res,
        400,
        `Email ${loginEmail} is not registered as ${loginAccountType}!`
      );
    } else {
      // Check if email is verified
      if (
        results[0].email_verified === "0" ||
        results[0].email_verified === 0
      ) {
        helpers.customErrorResponse(
          res,
          400,
          `Check the email ${results[0].user_email} for verification, or verify again through the forget password page.`
        );
      } else {
        // Check password
        bcrypt.compare(
          loginPassword,
          results[0].user_password,
          (bErr, bResult) => {
            if (bErr) {
              helpers.customErrorResponse(res, 401, bErr);
            }

            if (bResult === false) {
              helpers.customErrorResponse(res, 400, "Password is incorrect!");
            } else {
              const userData = {
                user_name: results[0].user_name,
                user_id: results[0].user_id,
                account_type: results[0].account_type,
                user_store: results[0].user_store,
              };

              const token = jwt.sign(userData, "SECRETKEY", {
                expiresIn: "7d",
              });

              const lastlogin = userModel.setlastlogin(results[0].user_id);
              lastlogin.then(() => {}).catch((err) => new Error(err));
              req.body.object = "user";
              req.body.action = "login";
              req.body.message = "login success";
              req.body.user_id = results[0].user_id;
              req.body.user_name = results[0].user_name;
              req.body.account_type = results[0].account_type;
              req.body.user_store = results[0].user_store;
              req.body.user_image = results[0].user_image;
              req.body.token = token;
              req.body.user_email = results[0].user_email;
              req.body.user_phone = results[0].user_phone;
              req.body.gender = results[0].gender;
              req.body.date_of_birth = results[0].date_of_birth;
              delete req.body.login_password;
              delete req.body.windowWidth;
              delete req.body.isSentResetPassword;
              delete req.body.login_account_type;
              delete req.body.login_email;

              next();
            }
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const SignUp = (req, res, next) => {
  const userName = req.body.username;
  const userEmail = req.body.useremail;
  const userPhone = req.body.user_phone;
  const getUsername = userModel.getFieldAlreadyInUse(
    userName,
    userEmail,
    userPhone
  );

  getUsername
    .then((result) => {
      if (result.length) {
        result.forEach((element) => {
          const inUse =
            element.user_name === userName
              ? "username"
              : element.user_email === userEmail
              ? "email"
              : "phone number";
          helpers.customErrorResponse(
            res,
            400,
            `This ${inUse} is already in use!`
          );
        });
      } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err,
            });
          } else {
            // has hashed password => add to database
            const newUser = {
              user_name: req.body.username,
              user_email: req.body.useremail,
              user_phone: req.body.user_phone || null,
              user_store: req.body.userstore || null,
              user_password: hash,
              user_image: null,
              account_type: req.body.account_type,
            };
            const insertNewUser = userModel.insertNewUser(newUser);
            insertNewUser
              .then((result) => {
                // send verification email
                async.waterfall([
                  function (done) {
                    // create token
                    crypto.randomBytes(20, function (err, buf) {
                      var token = buf.toString("hex");
                      done(err, token);
                    });
                  },
                  // insert token into user document
                  function (token, done) {
                    const User = userModel.getUserName(req.body.username);
                    User.then((result) => {
                      const user = result[0];
                      try {
                        // set token
                        userModel.setEmailVerifyToken(token, user.user_id);
                      } catch (error) {
                        helpers.customErrorResponse(res, 500, error);
                      }
                      done(err, token, user);
                    }).catch();
                  },
                  // send confirmation email to user
                  function (token, user, done) {
                    const userEmail = req.body.useremail;
                    const emailSubject = "Email Verification";
                    const emailContent = `<p>Hi ${user.user_email},</p>
                  <p>Thank you for creating an account with our application.</p></br>
                  <ul>
                  <li>user_id : ${user.user_id}</li>
                  <li>user_name : ${user.user_name}</li>
                  <li>password : ${req.body.password}</li>
                  <li>account_type : ${user.account_type}</li>
                  <li>user_phone : ${user.user_phone}</li>
                  </ul></br>
                  Please verify your email by clicking the following link
                  <a href=http://${req.headers.host}/api/v1/user/verify-email/${token}>Confirm</a>`;

                    req.body.user_email = userEmail;
                    req.body.email_subject = emailSubject;
                    req.body.email_content = emailContent;
                    delete req.body.password;
                    delete req.body.password_repeat;

                    next();
                  },
                ]);
              })
              .catch((err) => {
                throw err;
              });
          }
        });
      }
    })
    .catch((err) => {
      throw err;
    });
};

module.exports = {
  login: Login,
  signUp: SignUp,
};
