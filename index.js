require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const path = require("path");
const helmet = require("helmet");

const productsRouter = require("./routes/productsRoutes");
const usersRouter = require("./routes/userRoutes");
const addressesRouter = require("./routes/addressRoutes");
const commentsRouter = require("./routes/commentsRoutes");
const tagAndCategoriesRouter = require("./routes/tagsCategoriesRoutes");
const pagesRouter = require("./routes/pagesRoutes");
const ordersRouter = require("./routes/ordersRoutes");

const AuthMiddleware = require("./middlewares/authMiddleware");
const AppResponseDto = require("./dtos/responses/appResponseDto");
const BenchmarkMiddleware = require("./middlewares/benchmarkMiddleware");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(helmet());

// Use CORS middleware to allow cross-origin requests
var corsOptions = {
  origin: "http://localhost:3000",
};
app.use(BenchmarkMiddleware.benchmark);
app.use(AuthMiddleware.loadUser);
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// routers
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api", commentsRouter);
app.use("/api", addressesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api", tagAndCategoriesRouter);
app.use("/api", pagesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handling middleware
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
