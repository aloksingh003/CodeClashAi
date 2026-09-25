const Battle = require("../models/Battle");
const Problem = require("../models/Problem");

const {
  executeCode,
} = require("../services/codeExecutionService");

const supportedLanguages = [
  "cpp",
  "javascript",
  "python",
];

const normalizeOutput = (output = "") => {
  return String(output)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
};

const validateCode = (language, code) => {
  if (!language || !supportedLanguages.includes(language)) {
    return "Unsupported programming language";
  }

  if (!code || !code.trim()) {
    return "Code is required";
  }

  if (code.length > 20000) {
    return "Code is too large";
  }

  return null;
};

const runCode = async (req, res) => {
  try {
    const { language, code, stdin = "" } = req.body;

    const validationError = validateCode(language, code);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (stdin.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Input is too large",
      });
    }

    const result = await executeCode({
      language,
      code,
      stdin,
    });

    res.status(200).json({
      success: true,
      message: "Code execution completed",
      result,
    });
  } catch (error) {
    console.error(`Run code error: ${error.message}`);

    res.status(502).json({
      success: false,
      message: error.message,
    });
  }
};

const submitCode = async (req, res) => {
  try {
    const { roomCode, language, code } = req.body;

    const validationError = validateCode(language, code);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (!roomCode || !roomCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room code is required",
      });
    }

    const normalizedRoomCode = roomCode
      .trim()
      .toUpperCase();

    const battle = await Battle.findOne({
      roomCode: normalizedRoomCode,
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "Battle room not found",
      });
    }

    const isPlayer = battle.players.some(
      (player) =>
        player.user.toString() === req.user._id.toString()
    );

    if (!isPlayer) {
      return res.status(403).json({
        success: false,
        message: "You are not a player in this battle",
      });
    }

    if (battle.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Battle is not active",
      });
    }

    if (battle.winner) {
      return res.status(409).json({
        success: false,
        message: "Battle already has a winner",
      });
    }

    const problem = await Problem.findById(
      battle.problem
    ).select("+testCases");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Battle problem not found",
      });
    }

    if (!problem.testCases.length) {
      return res.status(400).json({
        success: false,
        message: "No test cases are available",
      });
    }

    let passedTests = 0;

    for (
      let index = 0;
      index < problem.testCases.length;
      index += 1
    ) {
      const testCase = problem.testCases[index];

      const result = await executeCode({
        language,
        code,
        stdin: testCase.input,
      });

      if (result.status !== "0") {
        return res.status(200).json({
          success: true,
          accepted: false,
          verdict: result.compilerOutput
            ? "Compilation Error"
            : "Runtime Error",
          passedTests,
          totalTests: problem.testCases.length,
          failedTest: index + 1,
          error:
            result.compilerOutput ||
            result.programError ||
            "Code execution failed",
        });
      }

      const actualOutput = normalizeOutput(
        result.programOutput
      );

      const expectedOutput = normalizeOutput(
        testCase.expectedOutput
      );

      if (actualOutput !== expectedOutput) {
        return res.status(200).json({
          success: true,
          accepted: false,
          verdict: "Wrong Answer",
          passedTests,
          totalTests: problem.testCases.length,
          failedTest: index + 1,
        });
      }

      passedTests += 1;
    }

    const completedBattle =
      await Battle.findOneAndUpdate(
        {
          _id: battle._id,
          status: "active",
          winner: null,
        },
        {
          $set: {
            winner: req.user._id,
            status: "completed",
            endedAt: new Date(),
          },
        },
        {
          returnDocument: "after",
        }
      );

    if (!completedBattle) {
      return res.status(409).json({
        success: false,
        message: "Another player already won the battle",
      });
    }

    res.status(200).json({
      success: true,
      accepted: true,
      verdict: "Accepted",
      passedTests,
      totalTests: problem.testCases.length,
      message: "All test cases passed. You won!",
      battle: {
        roomCode: completedBattle.roomCode,
        status: completedBattle.status,
        winner: completedBattle.winner,
        endedAt: completedBattle.endedAt,
      },
    });
  } catch (error) {
    console.error(`Submit code error: ${error.message}`);

    res.status(502).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  runCode,
  submitCode,
};