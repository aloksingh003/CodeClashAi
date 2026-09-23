const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const battleRoutes = require("./routes/battleRoutes");

const authRoutes = require("./routes/authRoutes");



const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.use("/api/battles", battleRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CodeClash API is running",
  });
});

module.exports = app;