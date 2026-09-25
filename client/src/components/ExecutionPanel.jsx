import { useState } from "react";

const API_URL = "http://localhost:5000/api";

const ExecutionPanel = ({ language, code, roomCode, battleStatus }) => {
  const [stdin, setStdin] = useState("");
  const [runResult, setRunResult] = useState(null);

  const [submissionResult, setSubmissionResult] = useState(null);

  const [aiFeedback, setAiFeedback] = useState("");
  const [aiMode, setAiMode] = useState("hint");
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

  const handleAIFeedback = async () => {
    const mode = battleStatus === "completed" ? "review" : "hint";

    try {
      setIsRequestingAI(true);
      setError("");
      setAiFeedback("");
      setAiMode(mode);

      const data = await sendRequest("/ai/feedback", {
        roomCode,
        language,
        code,
        mode,
      });

      setAiFeedback(data.feedback);
    } catch (aiError) {
      setError(aiError.message);
    } finally {
      setIsRequestingAI(false);
    }
  };

  const isBusy = isRunning || isSubmitting || isRequestingAI;

  const isBattleActive = battleStatus === "active";

  return (
    <section className="execution-panel">
      <div className="input-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Test your solution</span>
            <h3>Custom Input</h3>
          </div>
        </div>

        <textarea
          className="custom-input"
          value={stdin}
          onChange={(event) => setStdin(event.target.value)}
          placeholder="Enter input, for example: 5 7"
          rows={4}
        />
      </div>

      <div className="action-row">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={handleRunCode}
          disabled={isBusy || !code.trim()}
        >
          {isRunning ? "Running..." : "▶ Run Code"}
        </button>

        {isBattleActive && (
          <button
            className="btn btn-success"
            type="button"
            onClick={handleSubmitCode}
            disabled={isBusy || !code.trim() || !roomCode}
          >
            {isSubmitting ? "Submitting..." : "✓ Submit Code"}
          </button>
        )}

        <button
          className="btn btn-ai"
          type="button"
          onClick={handleAIFeedback}
          disabled={isBusy || !code.trim() || !roomCode}
        >
          {isRequestingAI
            ? "AI is thinking..."
            : battleStatus === "completed"
              ? "✦ Review My Code"
              : "✦ Get AI Hint"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="result-grid">
        <section className="result-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Execution result</span>
              <h3>Output</h3>
            </div>
          </div>

          {!runResult && !submissionResult && (
            <p className="empty-state">Run your code to see its output.</p>
          )}

          {runResult?.compilerOutput && (
            <div>
              <h4>Compiler Output</h4>
              <pre>{runResult.compilerOutput}</pre>
            </div>
          )}

          {runResult?.programError && (
            <div>
              <h4 className="text-error">Runtime Error</h4>
              <pre className="text-error">{runResult.programError}</pre>
            </div>
          )}

          {runResult && (
            <pre className="program-output">
              {runResult.programOutput ||
                (runResult.status === "0"
                  ? "Program finished without output"
                  : "Execution failed")}
            </pre>
          )}

          {submissionResult && (
            <div
              className={`verdict-card ${
                submissionResult.accepted
                  ? "verdict-success"
                  : "verdict-failure"
              }`}
            >
              <h3>{submissionResult.verdict}</h3>

              <p>
                Passed{" "}
                <strong>
                  {submissionResult.passedTests}/{submissionResult.totalTests}
                </strong>{" "}
                hidden tests
              </p>

              {submissionResult.failedTest && (
                <p>Failed hidden test: {submissionResult.failedTest}</p>
              )}

              {submissionResult.message && <p>{submissionResult.message}</p>}

              {submissionResult.error && <pre>{submissionResult.error}</pre>}
            </div>
          )}
        </section>

        <section className="result-card ai-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Powered by Gemini</span>

              <h3>
                {aiMode === "review" ? "AI Code Review" : "AI Coding Coach"}
              </h3>
            </div>

            <span className="ai-badge">AI</span>
          </div>

          {aiFeedback ? (
            <p className="ai-feedback">{aiFeedback}</p>
          ) : (
            <p className="empty-state">
              Ask for a progressive hint without revealing the complete
              solution.
            </p>
          )}
        </section>
      </div>
    </section>
  );
};

export default ExecutionPanel;
