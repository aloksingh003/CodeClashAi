import { useEffect, useState } from "react";
import socket from "./socket";

const API_URL = "http://localhost:5000";

function App() {
  const [email, setEmail] = useState("aloktest01@example.com");
  const [password, setPassword] = useState("test123");
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setMessage("");
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConnectionError = (error) => {
      setConnected(false);
      setMessage(error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectionError);

    const checkSession = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          socket.connect();
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectionError);
      socket.disconnect();
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setUser(data.user);
    setMessage(data.message);
    socket.connect();
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    socket.disconnect();
    setUser(null);
    setConnected(false);
    setMessage("Logout successful");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <div>
        <h1>CodeClash AI</h1>
        <p>Real-Time Coding Battles</p>

        <form onSubmit={handleLogin}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button type="submit">Login</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    );
  }

  return (
    <div>
      <h1>CodeClash AI</h1>

      <p>Welcome, {user.username}</p>

      <p>Socket status: {connected ? "Connected" : "Disconnected"}</p>

      {message && <p>{message}</p>}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default App;
