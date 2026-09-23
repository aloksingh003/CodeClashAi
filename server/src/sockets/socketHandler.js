const { Server } = require("socket.io");
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

    socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected: ${socket.user.username} - ${reason}`
      );
    });
  });

  return io;
};

module.exports = initializeSocket;