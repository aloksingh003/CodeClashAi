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

module.exports = {
  createBattle,
};