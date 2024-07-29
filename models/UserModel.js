require("dotenv").config();
const db = require("../configs/db");
const uuid = require("uuid");

const login = (email, accountType) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM jg_ecommerce.tb_user WHERE user_email = '${email}' AND account_type = '${accountType}'`,
      (error, result) => {
        if (!error) {
          resolve(result);
        } else {
          reject(new Error(error));
        }
      }
    );
  });
};

const insertNewUser = (data) => {
  return new Promise(function (resolve, reject) {
    db.query(
      `INSERT INTO jg_ecommerce.tb_user (
            user_id, 
            user_name, 
            user_email, 
            user_phone, 
            user_store, 
            user_password, 
            registered_at, 
            last_login, 
            user_image,
            email_verified,
            account_type) 
        VALUES (
            '${uuid.v4()}', 
            '${data.user_name}', 
            '${data.user_email}',
            '${data.user_phone}',
            '${data.user_store}',
            '${data.user_password}', 
            now(),
            NULL,
            NULL,
            '0',
            '${data.account_type}')`,
      function (error, result) {
        if (!error) {
          resolve(result);
        } else {
          reject(new Error(error));
        }
      }
    );
  });
};
