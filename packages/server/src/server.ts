import express from "express"
import http from "http"
import { Server, Socket } from "socket.io"
import cors from "cors"
import { ClientEventHandler } from "./events/ClientEventHandler"
import { sessionManager } from "./SessionManager"

const app = express()
const server = http.createServer(app)
export const io = new Server(server, {
  cors: {
    origin: "*", // Adjust later for production
  },
})

sessionManager.io = io

io.use((socket: Socket, next) => {
  const { playerId, connectToken } = socket.handshake.auth

  if (!playerId || typeof playerId !== "string") {
    return next(new Error("Player ID is required"))
  }
  if (playerId.length < 2 || playerId.length > 20) {
    return next(new Error("Player ID must be between 2 and 20 characters."))
  }

  const session = sessionManager.createOrRestoreSession(
    socket,
    playerId,
    connectToken
  )
  if (!session) {
    return next(new Error("Player ID is taken."))
  } else {
    socket.data.playerId = playerId
    socket.data.connectToken = session.connectToken
    socket.data.inLobby = session.inLobby
    socket.data.inGame = session.inGame
    socket.data.gameId = session.gameId
    next()
  }
})

io.on("connection", (socket) => {
  const { playerId, connectToken, gameId } = socket.data

  // Return the connection token

  // Send connection confirmation with token
  socket.emit("connection-established", {
    connectToken: connectToken,
    gameId: gameId,
  })

  // Create event handler
  new ClientEventHandler(socket, playerId)
})

app.get("/", (_req, res) => {
  res.send("Server is running!")
})
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
