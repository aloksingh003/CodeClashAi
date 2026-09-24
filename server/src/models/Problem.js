const mongoose = require("mongoose");

const exampleSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    constraints: {
      type: [String],
      default: [],
    },

    examples: {
      type: [exampleSchema],
      default: [],
    },

    starterCode: {
      cpp: {
        type: String,
        default: "",
      },
      javascript: {
        type: String,
        default: "",
      },
      python: {
        type: String,
        default: "",
      },
    },

    testCases: {
      type: [testCaseSchema],
      default: [],
      select: false,
    },

    timeLimit: {
      type: Number,
      default: 2000,
    },

    source: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Problem", problemSchema);