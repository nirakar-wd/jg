const express = require("express");
const router = express.Router();
const tagCategoriesController = require("../controllers/tagsCategoriesController");
const upload = require("../helpers/upload").upload;
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const setUploadPath = require("../middlewares/uploadMiddleware").setUploadPath;

router.get("/categories", tagCategoriesController.getCategories);
router.get("/tags", tagCategoriesController.getTags);
router.get("/collections", tagCategoriesController.getCollections);
router.post(
  "/categories",
  // verifyToken,
  // isAdmin,
  // setUploadPath("./public/images/categories"),
  // upload.array("images", 6),
  tagCategoriesController.createCategory
);
router.post(
  "/tags",
  verifyToken,
  isAdmin,
  setUploadPath("./public/images/tags"),
  upload.array("images", 6),
  tagCategoriesController.createTag
);
router.post(
  "/collections",
  verifyToken,
  isAdmin,
  tagCategoriesController.createCollections
);
module.exports = router;
