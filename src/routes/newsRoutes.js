
const express = require("express");

const {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
} = require("../controllers/newsController");

const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

const validate = require("../middlewares/validateMiddleware");

const {
  createNewsSchema,
  updateNewsSchema,
} = require ("../validation/newsValidation");

const router = express.Router();

// Public
router.get("/", getAllNews);
router.get("/:id", getNewsById);

// Admin
router.post(
  "/",
  protect,
  adminOnly,
  validate(createNewsSchema),
  createNews
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  validate(updateNewsSchema),
  updateNews
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteNews
);

module.exports = router;