require("dotenv").config();
const rateLimit = require("express-rate-limit");
// const RedisStore = require('rate-limit-redis');
// const redis = require('redis');
const express = require("express");
const cors = require("cors");
// const logger = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { verifyToken, isAdmin } = require("./middlewares/authMiddleware");

const productsRouter = require("./routes/productsRoutes");
const usersRouter = require("./routes/userRoutes");
const addressesRouter = require("./routes/addressRoutes");
const commentsRouter = require("./routes/commentsRoutes");
const tagAndCategoriesRouter = require("./routes/tagsCategoriesRoutes");
const pagesRouter = require("./routes/pagesRoutes");
const ordersRouter = require("./routes/ordersRoutes");
const cartsRouter = require("./routes/cartRoutes");

const app = express();
// const redisClient = redis.createClient();

// redisClient.connect().catch(console.error); // Ensure the client connects properly

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
// app.use(helmet());

// Use CORS middleware to allow cross-origin requests
const corsOptions = {
  origin: "http://localhost:4000", // Allow this origin
  credentials: true, // Allow credentials (cookies, etc.)
};

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

// Define a rate limiter
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 100 requests per window
//   message: "Too many requests, please try again later",
// });

// // Apply rate limiter to all requests
// app.use("/api", limiter);

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

// Middleware to set global variables for views

app.use((req, res, next) => {
  res.locals.APP_API_URL_DEV = process.env.APP_API_URL_DEV;
  res.locals.APP_API_URL = process.env.APP_API_URL;
  next();
});


app.set("view engine", "ejs");

// Set the directory where the views (EJS templates) are located
app.set("views", path.join(__dirname, "public/views"));

// Serve your HTML file at the root URL
app.get("/", (req, res) => {
  res.render("index"); // Renders index.ejs
});

app.get("/categories", (req, res) => {
  res.render("categories"); // Renders categories.ejs
});

app.get("/categories/:categoryId", (req, res) => {
  res.render("productsCategories", { categoryId: req.params.categoryId }); // Pass dynamic data
});

app.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.render("admin"); // Renders admin.ejs
});

app.get("/aboutUs", (req, res) => {
  res.render("aboutus"); // Renders aboutus.ejs
});

app.get("/cart", (req, res) => {
  res.render("cart"); // Renders cart.ejs
});

app.get("/orders", (req, res) => {
  res.render("orders"); // Renders orders.ejs
});

app.get("/checkout", (req, res) => {
  res.render("checkoutOrder"); // Renders checkoutOrder.ejs
});

app.get("/order/:orderId", (req, res) => {
  res.render("orderDetails");
});

app.get("/termsAndConditions", (req, res) => {
  res.render("t&c"); // Renders t&c.ejs
});

app.get("/products", (req, res) => {
  res.render("product"); // Renders product.ejs
});

app.get("/products/:productId", (req, res) => {
  res.render("productDetails");
});

app.get("/login", (req, res) => {
  res.render("signin"); // Renders signin.ejs
});

app.get("/register", (req, res) => {
  res.render("register"); // Renders register.ejs
});

app.get("/deliveryPolicy", (req, res) => {
  res.render("p&p"); // Renders p&p.ejs
});

app.get("/contacts", (req, res) => {
  res.render("contact"); // Renders contact.ejs
});

app.get("/newArrivals", (req, res) => {
  res.render("newarrivals"); // Renders newarrivals.ejs
});

app.get("/digitalMarketing", (req, res) => {
  res.render("digitalmarketing"); // Renders digitalmarketing.ejs
});

app.get("/editCategory/:categoryId", (req, res) => {
  res.render("editcategory"); 
});

app.get("/editTag/:tagId", (req, res) => {
  res.render("editTag"); 
});

app.get("/editCollection/:collectionId", (req, res) => {
  res.render("editCollection"); // Pass dynamic data
});

app.get("/edition", (req, res) => {
  res.render("edition"); // Renders edition.ejs
});

app.get("/editProduct/:productId", (req, res) => {
  res.render("editproduct"); 
});

app.get("/editOrder/:orderId", (req, res) => {
  res.render("editOrder"); 
});

app.get("/manageProduct", (req, res) => {
  res.render("manageproduct"); // Renders manageproduct.ejs
});

app.get("/checkoutSuccess", (req, res) => {
  res.render("checkoutsuccess"); // Renders checkoutsuccess.ejs
});

app.get("/myProfile", verifyToken, (req, res) => {
  res.render("userProfile"); // Renders userProfile.ejs
});

app.get("/myLocation", verifyToken, (req, res) => {
  res.render("userLocation"); // Renders userLocation.ejs
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
