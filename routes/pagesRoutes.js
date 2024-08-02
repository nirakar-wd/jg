const router = require("express").Router();
const PagesController = require("../controllers/pagesController");

router.get("", PagesController.index);
router.get("/home", PagesController.index);

module.exports = router;
