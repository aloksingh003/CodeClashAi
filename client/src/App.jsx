import { useEffect, useState } from "react";
import socket from "./socket";

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>CodeClash AI</h1>
      <p>Real-Time Coding Battles</p>

      <p>Socket status: {connected ? "Connected" : "Disconnected"}</p>
    </div>
  );
}

export default App;
