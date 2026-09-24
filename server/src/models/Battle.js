const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    ready: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const battleSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    players: {
      type: [playerSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["waiting", "active", "completed"],
      default: "waiting",
    },

    problem: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Problem",
  default: null,
   },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Battle", battleSchema);