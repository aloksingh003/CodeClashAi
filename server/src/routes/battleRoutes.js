const express = require("express");
const { createBattle } = require("../controllers/battleController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBattle);

module.exports = router;