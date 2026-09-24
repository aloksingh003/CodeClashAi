const WANDBOX_URL = "https://wandbox.org/api";

let compilerListCache = null;

const languageSettings = {
  cpp: {
    preferredCompilers: ["gcc-head", "clang-head"],
    languageNames: ["c++", "cpp"],
    compilerOptions: "-std=c++17",
  },

  javascript: {
    preferredCompilers: ["nodejs-head"],
    languageNames: ["javascript", "node.js"],
    compilerOptions: "",
  },

  python: {
    preferredCompilers: ["cpython-head"],
    languageNames: ["python", "python3"],
    compilerOptions: "",
  },
};

const getCompilerList = async () => {
  if (compilerListCache) {
    return compilerListCache;
  }

  const response = await fetch(`${WANDBOX_URL}/list.json`);

  if (!response.ok) {
    throw new Error("Unable to fetch compiler list");
  }

  compilerListCache = await response.json();

  return compilerListCache;
};

const getCompilerName = async (language) => {
  const settings = languageSettings[language];

  if (!settings) {
    throw new Error("Unsupported programming language");
  }

  const compilers = await getCompilerList();

  for (const preferredName of settings.preferredCompilers) {
    const compiler = compilers.find(
      (item) => item.name === preferredName
    );

    if (compiler) {
      return compiler.name;
    }
  }

  const compiler = compilers.find((item) => {
    const compilerLanguage =
      item.language?.toLowerCase() || "";

    return settings.languageNames.some((name) =>
      compilerLanguage.includes(name)
    );
  });

  if (!compiler) {
    throw new Error(
      `No compiler available for ${language}`
    );
  }

  return compiler.name;
};

const executeCode = async ({
  language,
  code,
  stdin = "",
}) => {
  const settings = languageSettings[language];
  const compiler = await getCompilerName(language);

  const response = await fetch(
    `${WANDBOX_URL}/compile.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        compiler,
        code,
        stdin,
        "compiler-option-raw":
          settings.compilerOptions,
        save: false,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Code execution failed"
    );
  }

  return {
    compiler,
    status: result.status || "",
    compilerOutput: result.compiler_output || "",
    programOutput: result.program_output || "",
    programError: result.program_error || "",
    signal: result.signal || "",
  };
};

module.exports = {
  executeCode,
};