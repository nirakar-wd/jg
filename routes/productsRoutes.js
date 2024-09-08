const productsController = require("../controllers/productsController");
const router = require("express").Router();
const upload = require("../helpers/upload").upload;
const setUploadPath = require("../middlewares/uploadMiddleware").setUploadPath;
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

require("./param_loaders/productsLoader").init(router);
// require("./param_loaders/tagsLoader").init(router);

router.get("/by_slug/:slug", productsController.getProductBySlug);
router.get("/by_id/:productId", productsController.getProductById);

router.get("/by_tag/:tag_slug", productsController.getByTag);
router.get("/by_tag_id/:tagId", productsController.getByTag);

router.get("/by_category/:category_slug", productsController.getByCategory);
router.get("/by_category_id/:categoryId", productsController.getByCategory);

router.get("/", productsController.getAll);
router.get("/bestSeller", productsController.getBestSellerProducts);
router.get("/filter", productsController.getFilteredProducts);
router.get("/search", productsController.searchProduct);

router.post(
  "/",
  verifyToken,
  isAdmin,
  setUploadPath("./public/images/products"),
  upload.array("images", 6),
  productsController.createProduct
);
router.put(
  "/:productId",
  verifyToken,
  isAdmin,
  setUploadPath("./public/images/products"),
  upload.array("images", 6),
  productsController.updateProduct
);

router.delete(
  "/:product_load_ids",
  verifyToken,
  isAdmin,
  productsController.deleteProduct
);
router.delete(
  "/by_id/:product_load_ids",
  verifyToken,
  isAdmin,
  productsController.deleteProduct
);

module.exports = router;
