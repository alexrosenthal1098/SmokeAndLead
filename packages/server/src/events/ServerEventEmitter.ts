import { GameEvent } from "@smoke-and-lead/shared/src/Events"
import { PlayerId } from "../model/Player"
import { sessionManager } from "../SessionManager"
import { GameId } from "../GameManager"
import { Server } from "socket.io"

export abstract class SocketEventEmitter {
  constructor(private io: Server) {}

  sendToPlayer(playerId: PlayerId, event: GameEvent): void {
    let socket = sessionManager.getSession(playerId)?.socket
    if (!socket) {
      console.error(
        "Game attempted to send event to player without an active session."
      )
      return
    }

    socket.emit(event.type, event.data)
  }

  sendToRoom(gameId: GameId, event: GameEvent): void {
    this.io.to(gameId).emit(event.type, event.data)
  }
}
