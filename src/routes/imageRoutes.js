const express = require("express");
const router = express.Router();

const { uploadImage } = require("../controllers/imageController");
const upload = require("../middlewares/imageUpload");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  uploadImage
);

module.exports = router;