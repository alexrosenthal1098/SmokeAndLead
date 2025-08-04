import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerSocketHandlers } from './socketHandler';
import { gameManager } from "./game/GameManager";


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust later for production
  },
});
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)
  new PlayerEventHandler(socket);
  socket.emit("hello", "Welcome to the board game server!");
});

app.get("/", (_req, res) => {
  res.send("Server is running!");
});

