const express = require("express");
const {
  createBattle,
  joinBattle,
} = require("../controllers/battleController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBattle);
router.post("/:roomCode/join", protect, joinBattle);

module.exports = router;