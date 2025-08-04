import { useState } from "react";
import { useLocation } from "wouter";

export default function HomePage() {
  const [gameName, setGameName] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();

  const handleJoin = () => {
    if (gameName && password) {
      navigate(`/game/${encodeURIComponent(gameName)}?password=${encodeURIComponent(password)}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Join or Start a Game</h1>
      <input
        className="w-full p-2 border rounded"
        placeholder="Game Name"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={handleJoin}>
        Enter Game
      </button>
    </div>
  );
}
