import { useEffect, useState } from "react";
import socket from "./socket";
import CodeEditor from "./components/CodeEditor";
import ExecutionPanel from "./components/ExecutionPanel";
import "./App.css";

const API_URL = "http://localhost:5000/api";

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
  const [email, setEmail] = useState("aloktest01@example.com");
  const [password, setPassword] = useState("test123");
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

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleSocketError);

    socket.on("battle_room_updated", handleBattleUpdate);

    socket.on("battle_started", handleBattleStarted);

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

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      setUser(data.user);
      setMessage(data.message);
      socket.connect();
    } catch (error) {
      setMessage(error.message);
    }
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

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!user) {
    return (
      <main>
        <h1>CodeClash AI</h1>
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        {message && <p>{message}</p>}
      </main>
    );
  }

  const isHost = battle && String(battle.players[0]?.user) === String(user.id);

  return (
    <main>
      <h1>CodeClash AI</h1>

      <p>Welcome, {user.username}</p>

      <p>Socket status: {connected ? "Connected" : "Disconnected"}</p>

      {!battle && (
        <section>
          <button onClick={handleCreateBattle}>Create Battle</button>

          <h3>OR</h3>

          <form onSubmit={handleJoinBattle}>
            <input
              type="text"
              placeholder="Enter room code"
              maxLength="6"
              value={roomCodeInput}
              onChange={(event) =>
                setRoomCodeInput(event.target.value.toUpperCase())
              }
            />

            <button type="submit">Join Battle</button>
          </form>
        </section>
      )}

      {battle && (
        <section>
          <h2>Room: {battle.roomCode}</h2>

          <p>Status: {battle.status}</p>

          <h3>Players</h3>

          <ul>
            {battle.players.map((player, index) => (
              <li key={player.user}>
                {player.username}
                {index === 0 ? " (Host)" : ""}
              </li>
            ))}
          </ul>

          {battle.status === "waiting" && (
            <>
              <p>
                {battle.players.length < 2
                  ? "Waiting for opponent..."
                  : "Both players joined!"}
              </p>

              {isHost ? (
                <button
                  onClick={handleStartBattle}
                  disabled={battle.players.length !== 2}
                >
                  Start Battle
                </button>
              ) : (
                <p>Waiting for host to start...</p>
              )}
            </>
          )}

          {battle.status === "active" && battle.problem && (
            <section>
              <h2>{battle.problem.title}</h2>

              <p>Difficulty: {battle.problem.difficulty}</p>

              <p>{battle.problem.description}</p>

              <h3>Constraints</h3>

              <ul>
                {battle.problem.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>

              <h3>Examples</h3>

              {battle.problem.examples.map((example, index) => (
                <div key={index}>
                  <h4>Example {index + 1}</h4>
                  <p>Input: {example.input}</p>
                  <p>Output: {example.output}</p>

                  {example.explanation && (
                    <p>Explanation: {example.explanation}</p>
                  )}
                </div>
              ))}

              <h3>Code Editor</h3>

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
              />
            </section>
          )}

          {message && <p>{message}</p>}
        </section>
      )}

      <button onClick={handleLogout}>Logout</button>
    </main>
  );
}

export default App;
