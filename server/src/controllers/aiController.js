const Battle = require("../models/Battle");
const Problem = require("../models/Problem");

const {
  generateCodingFeedback,
} = require("../services/aiService");

const lastAIRequest = new Map();
const AI_COOLDOWN_MS = 10000;

const getCodingFeedback = async (req, res) => {
  try {
    const {
      roomCode,
      language,
      code,
      mode = "hint",
    } = req.body;

    const supportedLanguages = [
      "cpp",
      "javascript",
      "python",
    ];

    const supportedModes = ["hint", "review"];

    if (!roomCode || !roomCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room code is required",
      });
    }

    if (
      !language ||
      !supportedLanguages.includes(language)
    ) {
      return res.status(400).json({
        success: false,
        message: "Unsupported programming language",
      });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    if (code.length > 20000) {
      return res.status(400).json({
        success: false,
        message: "Code is too large",
      });
    }

    if (!supportedModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported AI feedback mode",
      });
    }

    const normalizedRoomCode = roomCode
      .trim()
      .toUpperCase();

    const battle = await Battle.findOne({
      roomCode: normalizedRoomCode,
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "Battle room not found",
      });
    }

    const isPlayer = battle.players.some(
      (player) =>
        player.user.toString() === req.user._id.toString()
    );

    if (!isPlayer) {
      return res.status(403).json({
        success: false,
        message: "You are not a player in this battle",
      });
    }

    if (mode === "hint" && battle.status !== "active") {
      return res.status(400).json({
        success: false,
        message:
          "AI hints are available only during an active battle",
      });
    }

    const userId = req.user._id.toString();
    const previousRequestTime =
      lastAIRequest.get(userId) || 0;

    const remainingCooldown =
      AI_COOLDOWN_MS -
      (Date.now() - previousRequestTime);

    if (remainingCooldown > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${Math.ceil(
          remainingCooldown / 1000
        )} seconds before requesting AI again`,
      });
    }

    const problem = await Problem.findById(
      battle.problem
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Battle problem not found",
      });
    }

    lastAIRequest.set(userId, Date.now());

    const feedback = await generateCodingFeedback({
      mode,
      problem,
      language,
      code,
    });

    res.status(200).json({
      success: true,
      mode,
      feedback,
    });
  } catch (error) {
    console.error(
      `AI feedback error: ${error.message}`
    );

    res.status(502).json({
      success: false,
      message: "AI coach is currently unavailable",
    });
  }
};

module.exports = {
  getCodingFeedback,
};