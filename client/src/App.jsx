import { useEffect, useState } from "react";

import socket from "./socket";
import CodeEditor from "./components/CodeEditor";
import ExecutionPanel from "./components/ExecutionPanel";

import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [battle, setBattle] = useState(null);

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleSocketError = (error) => {
      setConnected(false);
      setMessage(error.message);
    };

    const handleBattleUpdate = (updatedBattle) => {
      setBattle(updatedBattle);
      setMessage("Battle room updated");
    };

    const handleBattleStarted = (startedBattle) => {
      setBattle(startedBattle);
      setLanguage("cpp");
      setCode(startedBattle.problem?.starterCode?.cpp || "");
      setMessage("Battle started!");
    };

    const handleBattleCompleted = (result) => {
      setBattle((currentBattle) => {
        if (!currentBattle || currentBattle.roomCode !== result.roomCode) {
          return currentBattle;
        }

        return {
          ...currentBattle,
          status: result.status,
          winner: result.winner,
          endedAt: result.endedAt,
        };
      });

      setMessage(`Battle completed! Winner: ${result.winner.username}`);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleSocketError);
    socket.on("battle_room_updated", handleBattleUpdate);
    socket.on("battle_started", handleBattleStarted);
    socket.on("battle_completed", handleBattleCompleted);

    const checkAuthentication = async () => {
      try {
        const data = await apiRequest("/auth/me");

        setUser(data.user);
        socket.connect();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleSocketError);
      socket.off("battle_room_updated", handleBattleUpdate);
      socket.off("battle_started", handleBattleStarted);
      socket.off("battle_completed", handleBattleCompleted);
    };
  }, []);

  const connectToBattleSocket = (roomCode) => {
    const joinSocketRoom = () => {
      socket.emit("join_battle_room", roomCode, (response) => {
        setMessage(response.message);
      });
    };

    if (socket.connected) {
      joinSocketRoom();
    } else {
      socket.once("connect", joinSocketRoom);
      socket.connect();
    }
  };

  const handleAuthentication = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      let data;

      if (isRegistering) {
        await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name,
            username,
            email,
            password,
          }),
        });

        data = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        });
      } else {
        data = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        });
      }

      setUser(data.user);

      setMessage(
        isRegistering
          ? "Account created and logged in successfully"
          : data.message,
      );

      socket.connect();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const toggleAuthenticationMode = () => {
    setIsRegistering((currentValue) => !currentValue);
    setName("");
    setUsername("");
    setPassword("");
    setMessage("");
  };

  const handleLogout = async () => {
    try {
      const data = await apiRequest("/auth/logout", {
        method: "POST",
      });

      socket.disconnect();

      setUser(null);
      setBattle(null);
      setRoomCodeInput("");
      setLanguage("cpp");
      setCode("");
      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setIsRegistering(false);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleCreateBattle = async () => {
    setMessage("");

    try {
      const data = await apiRequest("/battles", {
        method: "POST",
      });

      setBattle(data.battle);
      setRoomCodeInput(data.battle.roomCode);
      setMessage(data.message);

      connectToBattleSocket(data.battle.roomCode);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleJoinBattle = async (event) => {
    event.preventDefault();
    setMessage("");

    const roomCode = roomCodeInput.trim().toUpperCase();

    if (!roomCode) {
      setMessage("Please enter a room code");
      return;
    }

    try {
      const data = await apiRequest(`/battles/${roomCode}/join`, {
        method: "POST",
      });

      setBattle(data.battle);
      setMessage(data.message);

      connectToBattleSocket(roomCode);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleStartBattle = async () => {
    setMessage("");

    try {
      const data = await apiRequest(`/battles/${battle.roomCode}/start`, {
        method: "POST",
      });

      setBattle(data.battle);
      setLanguage("cpp");
      setCode(data.battle.problem?.starterCode?.cpp || "");
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleReturnToLobby = () => {
    setBattle(null);
    setRoomCodeInput("");
    setLanguage("cpp");
    setCode("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <main className="loading-page">
        <div className="loader" />
        <p>Loading CodeClash...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand brand-centered">
            <div className="brand-mark">&lt;/&gt;</div>

            <div>
              <h1>CodeClash AI</h1>
              <p>Real-time AI-powered coding battles</p>
            </div>
          </div>

          <div className="auth-heading">
            <span className="eyebrow">
              {isRegistering ? "Join the arena" : "Welcome back"}
            </span>

            <h2>
              {isRegistering ? "Create your account" : "Login to your account"}
            </h2>

            <p>
              {isRegistering
                ? "Create an account and start competing with developers."
                : "Enter the arena and challenge another developer."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleAuthentication}>
            {isRegistering && (
              <>
                <label className="form-field">
                  <span>Full name</span>

                  <input
                    type="text"
                    placeholder="Alok Singh"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Username</span>

                  <input
                    type="text"
                    placeholder="alok003"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                  />
                </label>
              </>
            )}

            <label className="form-field">
              <span>Email address</span>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="form-field">
              <span>Password</span>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength="6"
              />
            </label>

            <button className="btn btn-primary btn-full" type="submit">
              {isRegistering ? "Create Account" : "Enter CodeClash"}
            </button>
          </form>

          <div className="auth-switch">
            <span>
              {isRegistering ? "Already have an account?" : "New to CodeClash?"}
            </span>

            <button
              type="button"
              className="link-button"
              onClick={toggleAuthenticationMode}
            >
              {isRegistering ? "Login here" : "Create account"}
            </button>
          </div>

          {message && <div className="message-banner">{message}</div>}
        </section>
      </main>
    );
  }

  const isHost = battle && String(battle.players[0]?.user) === String(user.id);

  const winnerName = battle?.winner?.username;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">&lt;/&gt;</div>

          <div>
            <h1>CodeClash AI</h1>
            <p>AI-powered coding arena</p>
          </div>
        </div>

        <div className="topbar-actions">
          <div
            className={`connection-status ${connected ? "online" : "offline"}`}
          >
            <span className="connection-dot" />
            {connected ? "Live" : "Disconnected"}
          </div>

          <div className="user-chip">
            <span className="user-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </span>

            <span>{user.username}</span>
          </div>

          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {!battle && (
        <div className="page-container">
          <section className="lobby-grid">
            <article className="hero-card">
              <span className="eyebrow">Competitive coding</span>

              <h2>
                Code. Compete.
                <span> Improve with AI.</span>
              </h2>

              <p>
                Challenge another developer in a live coding battle. Execute
                code, pass hidden test cases and use AI guidance when you get
                stuck.
              </p>

              <div className="feature-list">
                <div className="feature-item">
                  <span>01</span>

                  <div>
                    <strong>Real-time battles</strong>
                    <p>Compete live using Socket.IO rooms.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <span>02</span>

                  <div>
                    <strong>Secure code judging</strong>
                    <p>Submit solutions against hidden tests.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <span>03</span>

                  <div>
                    <strong>AI coding coach</strong>
                    <p>Get useful hints without full solutions.</p>
                  </div>
                </div>
              </div>
            </article>

            <article className="lobby-card panel">
              <span className="eyebrow">Battle lobby</span>

              <h2>Start a coding battle</h2>

              <p>
                Create a new room or enter a room code shared by another player.
              </p>

              <button
                className="btn btn-primary btn-full"
                onClick={handleCreateBattle}
              >
                Create New Battle
              </button>

              <div className="divider">
                <span>OR JOIN A ROOM</span>
              </div>

              <form className="join-form" onSubmit={handleJoinBattle}>
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  maxLength="6"
                  value={roomCodeInput}
                  onChange={(event) =>
                    setRoomCodeInput(event.target.value.toUpperCase())
                  }
                />

                <button className="btn btn-secondary" type="submit">
                  Join Battle
                </button>
              </form>

              {message && <div className="message-banner">{message}</div>}
            </article>
          </section>
        </div>
      )}

      {battle && (
        <div className="battle-container">
          <section className="battle-summary panel">
            <div className="room-info">
              <span className="eyebrow">Battle room</span>

              <div className="room-title-row">
                <h2>{battle.roomCode}</h2>

                <span className={`status-badge status-${battle.status}`}>
                  {battle.status}
                </span>
              </div>
            </div>

            <div className="players-row">
              {battle.players.map((player, index) => (
                <div className="player-chip" key={player.user}>
                  <span className="player-avatar">
                    {player.username.charAt(0).toUpperCase()}
                  </span>

                  <div>
                    <strong>{player.username}</strong>

                    <span>{index === 0 ? "Host" : "Challenger"}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {winnerName && (
            <section className="winner-banner">
              <span className="winner-icon">🏆</span>

              <div>
                <span>Battle completed</span>
                <h2>{winnerName} won the battle!</h2>
              </div>

              <button
                className="btn btn-secondary return-lobby-button"
                onClick={handleReturnToLobby}
              >
                Return to Lobby
              </button>
            </section>
          )}

          {battle.status === "waiting" && (
            <section className="waiting-card panel">
              <div className="waiting-animation">
                <span />
                <span />
                <span />
              </div>

              <span className="eyebrow">Waiting room</span>

              <h2>
                {battle.players.length < 2
                  ? "Waiting for an opponent"
                  : "Both players are ready"}
              </h2>

              <p>
                {battle.players.length < 2
                  ? `Share room code ${battle.roomCode} with your opponent.`
                  : isHost
                    ? "Start the battle when you are ready."
                    : "Waiting for the host to start the battle."}
              </p>

              {isHost && (
                <button
                  className="btn btn-primary"
                  onClick={handleStartBattle}
                  disabled={battle.players.length !== 2}
                >
                  Start Battle
                </button>
              )}
            </section>
          )}

          {["active", "completed"].includes(battle.status) &&
            battle.problem && (
              <section className="battle-workspace">
                <aside className="problem-panel panel">
                  <div className="problem-header">
                    <div>
                      <span className="eyebrow">Problem</span>

                      <h2>{battle.problem.title}</h2>
                    </div>

                    <span
                      className={`difficulty-badge difficulty-${battle.problem.difficulty}`}
                    >
                      {battle.problem.difficulty}
                    </span>
                  </div>

                  <p className="problem-description">
                    {battle.problem.description}
                  </p>

                  <div className="problem-section">
                    <h3>Constraints</h3>

                    <ul className="constraint-list">
                      {battle.problem.constraints.map((constraint, index) => (
                        <li key={index}>{constraint}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="problem-section">
                    <h3>Examples</h3>

                    <div className="examples-list">
                      {battle.problem.examples.map((example, index) => (
                        <article className="example-card" key={index}>
                          <h4>Example {index + 1}</h4>

                          <div className="example-row">
                            <span>Input</span>
                            <code>{example.input}</code>
                          </div>

                          <div className="example-row">
                            <span>Output</span>
                            <code>{example.output}</code>
                          </div>

                          {example.explanation && (
                            <p>
                              <strong>Explanation:</strong>{" "}
                              {example.explanation}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                </aside>

                <section className="coding-panel">
                  <CodeEditor
                    starterCode={battle.problem.starterCode}
                    language={language}
                    setLanguage={setLanguage}
                    code={code}
                    setCode={setCode}
                  />

                  <ExecutionPanel
                    language={language}
                    code={code}
                    roomCode={battle.roomCode}
                    battleStatus={battle.status}
                  />
                </section>
              </section>
            )}

          {message && (
            <div className="battle-message message-banner">{message}</div>
          )}
        </div>
      )}
    </main>
  );
}

export default App;
