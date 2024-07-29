require("dotenv").config();
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "3308",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "jg_ecommerce",
});

connection.connect(function (err) {
  if (err) {
    console.log(err);
    //throw err;
  } else {
    console.log("DB connected :)");
  }
});

module.exports = connection;
