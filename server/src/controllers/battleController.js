const Battle = require("../models/Battle");
const Problem = require("../models/Problem");
const generateRoomCode = require("../utils/generateRoomCode");

const createBattle = async (req, res) => {
  try {
    let roomCode;
    let roomExists = true;

    while (roomExists) {
      roomCode = generateRoomCode();
      roomExists = await Battle.exists({ roomCode });
    }

    const battle = await Battle.create({
      roomCode,
      host: req.user._id,
      players: [
        {
          user: req.user._id,
          username: req.user.username,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Battle room created successfully",
      battle,
    });
  } catch (error) {
    console.error(`Create battle error: ${error.message}`);

    res.status(500).json({
      success: false,
      message: "Unable to create battle room",
    });
  }
};

const joinBattle = async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();

    const battle = await Battle.findOne({ roomCode });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "Battle room not found",
      });
    }

    if (battle.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Battle has already started",
      });
    }

    const alreadyJoined = battle.players.some(
      (player) =>
        player.user.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this room",
      });
    }

    if (battle.players.length >= 2) {
      return res.status(400).json({
        success: false,
        message: "Battle room is full",
      });
    }

    battle.players.push({
      user: req.user._id,
      username: req.user.username,
    });

    await battle.save();

    res.status(200).json({
      success: true,
      message: "Battle room joined successfully",
      battle,
    });
  } catch (error) {
    console.error(`Join battle error: ${error.message}`);

    res.status(500).json({
      success: false,
      message: "Unable to join battle room",
    });
  }
};

const startBattle = async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();

    const battle = await Battle.findOne({ roomCode });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "Battle room not found",
      });
    }

    const isHost =
      battle.host.toString() === req.user._id.toString();

    if (!isHost) {
      return res.status(403).json({
        success: false,
        message: "Only the host can start the battle",
      });
    }

    if (battle.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Battle has already started",
      });
    }

    if (battle.players.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Two players are required to start",
      });
    }

    const totalActiveProblems =
      await Problem.countDocuments({
        isActive: true,
      });

    if (totalActiveProblems === 0) {
      return res.status(404).json({
        success: false,
        message: "No coding problems are available",
      });
    }

    // Get the problem used in the latest battle.
    const previousBattle = await Battle.findOne({
      problem: {
        $ne: null,
      },
      _id: {
        $ne: battle._id,
      },
    })
      .sort({
        startedAt: -1,
      })
      .select("problem");

    const problemFilter = {
      isActive: true,
    };

    // Avoid selecting the previous problem again.
    if (
      previousBattle?.problem &&
      totalActiveProblems > 1
    ) {
      problemFilter._id = {
        $ne: previousBattle.problem,
      };
    }

    const availableProblemCount =
      await Problem.countDocuments(problemFilter);

    const randomIndex = Math.floor(
      Math.random() * availableProblemCount
    );

    const problem = await Problem.findOne(problemFilter)
      .select("_id")
      .skip(randomIndex);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Unable to select a coding problem",
      });
    }

    battle.problem = problem._id;
    battle.status = "active";
    battle.startedAt = new Date();

    await battle.save();

    // Explicitly prevent hidden test cases from reaching frontend.
    await battle.populate({
      path: "problem",
      select: "-testCases",
    });

    const battleData = {
      roomCode: battle.roomCode,
      status: battle.status,
      players: battle.players,
      problem: battle.problem,
      startedAt: battle.startedAt,
    };

    const io = req.app.get("io");

    io.to(roomCode).emit("battle_started", battleData);

    res.status(200).json({
      success: true,
      message: "Battle started successfully",
      battle: battleData,
    });
  } catch (error) {
    console.error(`Start battle error: ${error.message}`);

    res.status(500).json({
      success: false,
      message: "Unable to start battle",
    });
  }
};

module.exports = {
  createBattle,
  joinBattle,
  startBattle,
};