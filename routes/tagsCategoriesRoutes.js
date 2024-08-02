const express = require("express");
const router = express.Router();
const tagCategoriesController = require("../controllers/tagsCategoriesController");
const upload = require("../helpers/upload").upload;
const AuthMiddleware = require("../middlewares/authMiddleware");
const setUploadPath = require("../middlewares/uploadMiddleware").setUploadPath;

router.get("/categories", tagCategoriesController.getCategories);
router.get("/tags", tagCategoriesController.getTags);
router.post(
  "/categories",
  AuthMiddleware.mustBeAuthenticated,
  AuthMiddleware.isAdmin,
  setUploadPath("./public/images/categories"),
  upload.array("images", 6),
  tagCategoriesController.createCategory
);
router.post(
  "/tags",
  AuthMiddleware.mustBeAuthenticated,
  AuthMiddleware.isAdmin,
  setUploadPath("./public/images/tags"),
  upload.array("images", 6),
  tagCategoriesController.createTag
);
module.exports = router;
