const Battle = require("../models/Battle");
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

module.exports = {
  createBattle,
  joinBattle,
};