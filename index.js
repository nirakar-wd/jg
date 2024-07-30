require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
// const db = require("./configs/db");

const app = express();

const PORT = process.env.PORT || 3000;

// Use CORS middleware to allow cross-origin requests
var corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// routers
// const router = require('./routes/productRouter.js')
// app.use('/api/products', router)

// Define a route handler for the default home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Example route to test database connection
// app.get("/test-db", (req, res) => {
//   db.query("SELECT 1 + 1 AS solution", (err, results) => {
//     if (err) {
//       res.status(500).send("Database query failed");
//     } else {
//       res.send(`Database connected. The solution is: ${results[0].solution}`);
//     }
//   });
// });

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
