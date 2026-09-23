require("dotenv").config();

const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");
const initializeSocket = require("./sockets/socketHandler");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();