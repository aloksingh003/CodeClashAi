import { useEffect, useState } from "react";
import socket from "./socket";
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

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleSocketError);
    socket.on("battle_room_updated", handleBattleUpdate);

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

          <p>
            {battle.players.length < 2
              ? "Waiting for opponent..."
              : "Both players joined!"}
          </p>
        </section>
      )}

      {message && <p>{message}</p>}

      <button onClick={handleLogout}>Logout</button>
    </main>
  );
}

export default App;
