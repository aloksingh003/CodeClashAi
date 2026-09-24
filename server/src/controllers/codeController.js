const {
  executeCode,
} = require("../services/codeExecutionService");

const runCode = async (req, res) => {
  try {
    const { language, code, stdin = "" } = req.body;

    const supportedLanguages = [
      "cpp",
      "javascript",
      "python",
    ];

    if (!language || !supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported programming language",
      });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    if (code.length > 20000) {
      return res.status(400).json({
        success: false,
        message: "Code is too large",
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

module.exports = {
  runCode,
};