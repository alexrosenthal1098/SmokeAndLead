import { Route, Switch } from "wouter";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import { useEffect } from "react";
import { useSocket } from "./hooks/useSocket";

function App() {
  const socketRef = useSocket();

  useEffect(() => {
    if (!socketRef.current) return;

    // Example: emit a test join event
    socketRef.current.emit("joinGame", "demo-game", "hunter2");
  }, [socketRef]);

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/game/:gameName" component={GamePage} />
      <Route>404 Not Found</Route>
    </Switch>
  );
  
}

export default App
