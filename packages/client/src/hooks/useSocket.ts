import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

type ServerToClientEvents = {
  // Define incoming events from server here
  hello: (message: string) => void;
};

type ClientToServerEvents = {
  // Define events the client sends to the server
  joinGame: (gameId: string, password: string) => void;
};

export function useSocket() {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:8080"); // use env var for production later
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    socket.on("hello", (message) => {
      console.log("👋 Message from server:", message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
