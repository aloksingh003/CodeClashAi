import { useState } from "react";

const API_URL = "http://localhost:5000/api";

const ExecutionPanel = ({ language, code, roomCode }) => {
  const [stdin, setStdin] = useState("");
  const [runResult, setRunResult] = useState(null);

  const [submissionResult, setSubmissionResult] = useState(null);

  const [aiFeedback, setAiFeedback] = useState("");
  const [error, setError] = useState("");

  const [isRunning, setIsRunning] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRequestingAI, setIsRequestingAI] = useState(false);

  const sendRequest = async (path, requestBody) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  };

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setError("");
      setRunResult(null);

      const data = await sendRequest("/code/run", {
        language,
        code,
        stdin,
      });

      setRunResult(data.result);
    } catch (runError) {
      setError(runError.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      setSubmissionResult(null);

      const data = await sendRequest("/code/submit", {
        roomCode,
        language,
        code,
      });

      setSubmissionResult(data);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIHint = async () => {
    try {
      setIsRequestingAI(true);
      setError("");
      setAiFeedback("");

      const data = await sendRequest("/ai/feedback", {
        roomCode,
        language,
        code,
        mode: "hint",
      });

      setAiFeedback(data.feedback);
    } catch (aiError) {
      setError(aiError.message);
    } finally {
      setIsRequestingAI(false);
    }
  };

  const isBusy = isRunning || isSubmitting || isRequestingAI;

  return (
    <section>
      <h3>Custom Input</h3>

      <textarea
        value={stdin}
        onChange={(event) => setStdin(event.target.value)}
        placeholder="Example: 5 7"
        rows={5}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          resize: "vertical",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={handleRunCode}
          disabled={isBusy || !code.trim()}
        >
          {isRunning ? "Running..." : "Run Code"}
        </button>

        <button
          type="button"
          onClick={handleSubmitCode}
          disabled={isBusy || !code.trim() || !roomCode}
        >
          {isSubmitting ? "Submitting..." : "Submit Code"}
        </button>

        <button
          type="button"
          onClick={handleAIHint}
          disabled={isBusy || !code.trim() || !roomCode}
        >
          {isRequestingAI ? "AI is thinking..." : "Get AI Hint"}
        </button>
      </div>

      {error && (
        <pre
          style={{
            color: "#ff6b6b",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
      )}

      <h3>Output</h3>

      {runResult && (
        <div>
          {runResult.compilerOutput && (
            <>
              <h4>Compiler Output</h4>

              <pre style={{ whiteSpace: "pre-wrap" }}>
                {runResult.compilerOutput}
              </pre>
            </>
          )}

          {runResult.programError && (
            <>
              <h4>Runtime Error</h4>

              <pre
                style={{
                  color: "#ff6b6b",
                  whiteSpace: "pre-wrap",
                }}
              >
                {runResult.programError}
              </pre>
            </>
          )}

          <pre
            style={{
              backgroundColor: "#1e1e1e",
              color: "#ffffff",
              padding: "12px",
              minHeight: "60px",
              whiteSpace: "pre-wrap",
            }}
          >
            {runResult.programOutput ||
              (runResult.status === "0"
                ? "Program finished without output"
                : "Execution failed")}
          </pre>
        </div>
      )}

      {submissionResult && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",

            border: `2px solid ${
              submissionResult.accepted ? "#4caf50" : "#ff6b6b"
            }`,
          }}
        >
          <h3
            style={{
              color: submissionResult.accepted ? "#4caf50" : "#ff6b6b",
            }}
          >
            {submissionResult.verdict}
          </h3>

          <p>
            Passed: {submissionResult.passedTests}/{submissionResult.totalTests}
          </p>

          {submissionResult.failedTest && (
            <p>Failed hidden test: {submissionResult.failedTest}</p>
          )}

          {submissionResult.message && <p>{submissionResult.message}</p>}

          {submissionResult.error && (
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {submissionResult.error}
            </pre>
          )}
        </div>
      )}

      {aiFeedback && (
        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            border: "2px solid #8b5cf6",
            backgroundColor: "#1d1930",
          }}
        >
          <h3 style={{ color: "#a78bfa" }}>AI Coding Hint</h3>

          <p
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
            }}
          >
            {aiFeedback}
          </p>
        </div>
      )}
    </section>
  );
};

export default ExecutionPanel;
