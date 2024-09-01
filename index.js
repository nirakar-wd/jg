require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
// const logger = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const {
  verifyToken,
  isAdmin,
} = require("./middlewares/authMiddleware");

const productsRouter = require("./routes/productsRoutes");
const usersRouter = require("./routes/userRoutes");
const addressesRouter = require("./routes/addressRoutes");
const commentsRouter = require("./routes/commentsRoutes");
const tagAndCategoriesRouter = require("./routes/tagsCategoriesRoutes");
const pagesRouter = require("./routes/pagesRoutes");
const ordersRouter = require("./routes/ordersRoutes");
const cartsRouter = require("./routes/cartRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
// app.use(helmet());

// Use CORS middleware to allow cross-origin requests
const corsOptions = {
  origin: "http://localhost:4000", // Allow this origin
  credentials: true, // Allow credentials (cookies, etc.)
};
// app.use(BenchmarkMiddleware.benchmark);
// app.use(AuthMiddleware.loadUser);
app.use(cors(corsOptions));
app.use(cookieParser());
// app.use(logger("dev"));
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

// app.use("/api/protected-route", verifyToken, (req, res) => {
//   res.send("This is a protected route");
// });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static("public"));

// routers
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api", commentsRouter);
app.use("/api", cartsRouter);
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

app.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "admin.html"));
});

app.get("/aboutUs", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "aboutus.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "cart.html"));
});

app.get("/orders", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "orders.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "checkout.html"));
});

app.get("/checkout/:orderId", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "checkoutOrder.html"));
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

app.get("/contacts", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "contact.html"));
});

app.get("/newArrivals", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "newarrivals.html"));
});

app.get("/digitalMarketing", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "digitalmarketing.html"));
});

app.get("/editCategory/:categoryId", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "editcategory.html"));
});

app.get("/editTag/:tagId", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "editTag.html"));
});

app.get("/editCollection/:collectionId", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "editCollection.html"));
});

app.get("/edition", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "edition.html"));
});

app.get("/editProduct/:productId", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "editproduct.html"));
});

app.get("/manageProduct", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "manageproduct.html"));
});

app.get("/checkoutSuccess", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "checkoutsuccess.html"));
});

app.get("/myProfile", verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "userProfile.html"));
});

app.get("/myLocation", verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "userLocation.html"));
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
