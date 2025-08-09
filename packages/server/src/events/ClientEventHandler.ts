// ClientEventHandler.ts
import { Socket } from "socket.io"
import { gameManager } from "../GameManager"
import { PlayerId } from "@smoke-and-lead/server/src/model/Player"
import { ClientEvent, ExtractEventData } from "@smoke-and-lead/shared"

export class ClientEventHandler {
  constructor(private socket: Socket, private playerId: PlayerId) {
    this.socket = socket
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.socket.on("join-game", (data) =>
      this.handleEvent(this.socket, { type: "join-game", data })
    )
  }

  private handleEvent(socket: Socket, event: ClientEvent) {
    switch (event.type) {
      case "join-game":
        this.handleJoinGame(socket, event.data)
        break
      default:
        console.warn("Unhandled event type:", event.type)
    }
  }

  private handleJoinGame(
    socket: Socket,
    data: ExtractEventData<ClientEvent, "join-game">
  ) {
    // join a game
    // send an event back!
  }
}
