const crypto = require("crypto");

const generateRoomCode = () => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let roomCode = "";

  for (let index = 0; index < 6; index += 1) {
    const randomIndex = crypto.randomInt(characters.length);
    roomCode += characters[randomIndex];
  }

  return roomCode;
};

module.exports = generateRoomCode;