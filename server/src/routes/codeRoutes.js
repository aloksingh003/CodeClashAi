const express = require("express");

const {
  runCode,
  submitCode,
} = require("../controllers/codeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/run", protect, runCode);
router.post("/submit", protect, submitCode);

module.exports = router;