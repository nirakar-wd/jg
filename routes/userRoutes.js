const router = require("express").Router();
const controller = require("./../controllers/userController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/",
    //  verifyToken, 
    //  isAdmin, 
     controller.getAllUsers);
router.get("/:id", 
    // verifyToken,
     controller.getCurrentUser);
router.put("/:id", verifyToken, controller.editUser);
router.delete("/:id", verifyToken, isAdmin, controller.deleteUser);

module.exports = router;
