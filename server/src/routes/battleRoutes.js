const express = require("express");

const {
  createBattle,
  joinBattle,
  startBattle,
} = require("../controllers/battleController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBattle);
router.post("/:roomCode/join", protect, joinBattle);
router.post("/:roomCode/start", protect, startBattle);

module.exports = router;