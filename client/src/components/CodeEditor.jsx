import Editor from "@monaco-editor/react";

const editorLanguages = {
  cpp: "cpp",
  javascript: "javascript",
  python: "python",
};

function CodeEditor({
  starterCode = {},
  language,
  setLanguage,
  code,
  setCode,
}) {
  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;

    setLanguage(selectedLanguage);
    setCode(starterCode[selectedLanguage] || "");
  };

  return (
    <section>
      <div>
        <label htmlFor="language">Language: </label>

        <select id="language" value={language} onChange={handleLanguageChange}>
          <option value="cpp">C++</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      <Editor
        height="450px"
        theme="vs-dark"
        language={editorLanguages[language]}
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          fontSize: 15,
          minimap: {
            enabled: false,
          },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
        }}
      />
    </section>
  );
}

export default CodeEditor;
