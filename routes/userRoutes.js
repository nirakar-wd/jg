const router = require("express").Router();
const controller = require("./../controllers/userController");
const upload = require("../helpers/upload").upload;
const setUploadPath = require("../middlewares/uploadMiddleware").setUploadPath;
const { verifyToken, isAdmin, specificRateLimiter } = require("../middlewares/authMiddleware");

router.post("/register", controller.register);
router.post("/login",specificRateLimiter, controller.login);
router.post("/feedback", verifyToken, controller.createFeedback);

router.get("/usersGrowth", verifyToken, isAdmin, controller.getUserGrowthPercentage);
router.get("/", verifyToken, isAdmin, controller.getAllUsers);
router.get("/:id", verifyToken, controller.getCurrentUser);

router.put(
  "/:userId",
  verifyToken,
  setUploadPath("./public/images/users"),
  upload.array("images", 6),
  controller.editUser
);

router.delete("/:id", verifyToken, isAdmin, controller.deleteUser);

module.exports = router;
