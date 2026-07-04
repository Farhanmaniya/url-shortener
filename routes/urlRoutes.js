const express = require("express");
const router = express.Router();
const {
  handleURLShortening,
  handleGetAnalytics,
  handleMyLinks,
} = require("../controllers/urlController");
const { isLoggedIn } = require("../middleware/auth.middleware");

router.post("/shorten", handleURLShortening);
router.get("/analytics/:shortId", handleGetAnalytics);
router.get('/mylinks', isLoggedIn, handleMyLinks);
module.exports = router;
