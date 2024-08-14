require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const bodyParser = require("body-parser");

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

app.use(bodyParser.json());
// app.use(helmet());

// Use CORS middleware to allow cross-origin requests
const corsOptions = {
  origin: "http://127.0.0.1:4000", // Allow this origin
  credentials: true, // Allow credentials (cookies, etc.)
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
};
// app.use(BenchmarkMiddleware.benchmark);
// app.use(AuthMiddleware.loadUser);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

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
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// Serve your HTML file at the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "index.html"));
});

app.get("/categories", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "categories.html"));
});

app.get("/categories/:categoryId", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "productsCategories.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "admin.html"));
});

app.get("/aboutUs", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "aboutus.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "cart.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "checkout.html"));
});

app.get("/termsAndConditions", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "t&c.html"));
});

app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "product.html"));
});

app.get("/products/:productId", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "productDetails.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "signin.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "register.html"));
});

app.get("/deliveryPolicy", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "p&p.html"));
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
