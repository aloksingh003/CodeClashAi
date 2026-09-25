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
    <section className="editor-shell">
      <div className="editor-toolbar">
        <div>
          <span className="toolbar-dot red" />
          <span className="toolbar-dot yellow" />
          <span className="toolbar-dot green" />
        </div>

        <label htmlFor="language">
          Language
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </label>
      </div>

      <Editor
        height="500px"
        theme="vs-dark"
        language={editorLanguages[language]}
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          fontSize: 15,
          lineHeight: 23,
          minimap: {
            enabled: false,
          },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          padding: {
            top: 16,
          },
        }}
      />
    </section>
  );
}

export default CodeEditor;
