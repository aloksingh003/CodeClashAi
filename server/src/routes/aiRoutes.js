const express = require("express");

const {
  getCodingFeedback,
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/feedback", protect, getCodingFeedback);

module.exports = router;