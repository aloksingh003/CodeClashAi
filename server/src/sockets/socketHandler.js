const { Server } = require("socket.io");
const Battle = require("../models/Battle");
const socketAuth = require("./socketAuth");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(
      `Authenticated socket: ${socket.user.username} (${socket.id})`
    );

    socket.on(
      "join_battle_room",
      async (receivedRoomCode, callback) => {
        const sendResponse = (data) => {
          if (typeof callback === "function") {
            callback(data);
          }
        };

        try {
          const roomCode = receivedRoomCode
            ?.trim()
            .toUpperCase();

          if (!roomCode) {
            return sendResponse({
              success: false,
              message: "Room code is required",
            });
          }

          const battle = await Battle.findOne({ roomCode });

          if (!battle) {
            return sendResponse({
              success: false,
              message: "Battle room not found",
            });
          }

          const isBattlePlayer = battle.players.some(
            (player) =>
              player.user.toString() ===
              socket.user._id.toString()
          );

          if (!isBattlePlayer) {
            return sendResponse({
              success: false,
              message: "You are not a player in this battle",
            });
          }

          socket.join(roomCode);
          socket.data.roomCode = roomCode;

          io.to(roomCode).emit("battle_room_updated", {
            roomCode: battle.roomCode,
            players: battle.players,
            status: battle.status,
          });

          console.log(
            `${socket.user.username} joined socket room ${roomCode}`
          );

          sendResponse({
            success: true,
            message: "Socket joined battle room",
          });
        } catch (error) {
          console.error(
            `Join socket room error: ${error.message}`
          );

          sendResponse({
            success: false,
            message: "Unable to join socket room",
          });
        }
      }
    );

    socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected: ${socket.user.username} - ${reason}`
      );
    });
  });

  return io;
};

module.exports = initializeSocket;