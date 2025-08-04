import { useParams, useSearch } from "wouter";
import { useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

export default function GamePage() {
  const params = useParams();
  const searchParams = new URLSearchParams(useSearch());

  const gameName = decodeURIComponent(params.gameName || "");
  const password = decodeURIComponent(searchParams.get("password") || "test-password");

  const socketRef = useSocket();

  useEffect(() => {
    if (!socketRef.current) return;

    // Example: emit a test join event
    socketRef.current.emit("joinGame", "demo-game", password);
  }, [socketRef]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Game: {gameName}</h2>
      {/* Replace this with your game UI */}
      <p>You are now in the game. Waiting for other players…</p>
    </div>
  );
}
