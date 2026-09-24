const express = require("express");

const {
  runCode,
} = require("../controllers/codeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/run", protect, runCode);

module.exports = router;