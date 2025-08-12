import { ServerEvent } from "@smoke-and-lead/shared"
import { PlayerId } from "../model/Player"
import { sessionManager } from "../SessionManager"
import { GameId } from "../GameManager"
import { Server } from "socket.io"

export abstract class SocketEventEmitter {
  sendToPlayer(playerId: PlayerId, event: ServerEvent): void {
    const socket = sessionManager.getSession(playerId)?.socket
    if (!socket) {
      console.error(
        "Game attempted to send event to player without an active session."
      )
      return
    }

    socket.emit(event.type, event.data)
  }

  sendToRoom(gameId: GameId, event: ServerEvent): void {
    sessionManager.io!.to(gameId).emit(event.type, event.data)
  }
}
