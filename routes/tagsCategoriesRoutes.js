const express = require("express");
const router = express.Router();
const tagCategoriesController = require("../controllers/tagsCategoriesController");
const upload = require("../helpers/upload").upload;
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const setUploadPath = require("../middlewares/uploadMiddleware").setUploadPath;

router.get("/categories", tagCategoriesController.getCategories);
router.get("/categories/:categoryId", tagCategoriesController.getCategoryById);
router.get("/tags", tagCategoriesController.getTags);
router.get("/tags/:tagId", tagCategoriesController.getTagById);
router.get("/collections", tagCategoriesController.getCollections);
router.get("/collections/:collectionId", tagCategoriesController.getCollectionById);
router.post(
  "/categories",
  verifyToken,
  isAdmin,
  tagCategoriesController.createCategory
);
router.post(
  "/tags",
  verifyToken,
  isAdmin,
  tagCategoriesController.createTag
);
router.post(
  "/collections",
  verifyToken,
  isAdmin,
  tagCategoriesController.createCollections
);

// put routes
router.put("/categories/:categoryId", tagCategoriesController.updateCategoryById);
router.put("/tags/:tagId", tagCategoriesController.updateTagById);
router.put("/collections/:collectionId", tagCategoriesController.updateCollectionById);

//delete routes
router.delete("/categories/:id", tagCategoriesController.deleteCategoryById);
router.delete("/tags/:id", tagCategoriesController.deleteTagById);
router.delete("/collections/:id", tagCategoriesController.deleteCollectionById);

module.exports = router;
