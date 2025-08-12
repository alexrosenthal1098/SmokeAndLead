// ClientEventHandler.ts
import { Socket } from "socket.io"
import { gameManager } from "../GameManager"
import { sessionManager } from "../SessionManager"
import { PlayerId } from "@smoke-and-lead/server/src/model/Player"
import { ClientEvent, ExtractEventData } from "@smoke-and-lead/shared"

export class ClientEventHandler {
  constructor(private socket: Socket, private playerId: PlayerId) {
    this.socket = socket
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.socket.on("create-lobby", (data) => this.createLobby(data))



    this.socket.on("request-game-info", (data) => this.requestGameInfo(data))
    


    this.socket.on("join-game", (data) => this.handleJoinGame(data)) // WIP
  }

  // Specific event handlers
  private createLobby(data: ExtractEventData<ClientEvent, "create-lobby">) {
    gameManager.createLobby(this.playerId, data.gameId, data.password)
    this.socket.emit("lobby-created")
  }





  private requestGameInfo(data: ExtractEventData<ClientEvent, "request-game-info">) {
    const game = gameManager.getGame(data.gameId)
    if (game === undefined) {
      this.socket.emit("game-ended", { reason: "The game already ended" }) // TODO why do we have reason again?
      return
    }
    this.socket.emit("game-info", game.getGameInfo(this.playerId))
  }

  


  private handleJoinGame(data: ExtractEventData<ClientEvent, "join-game">) {
    //gameManager.getGame()
    // join a game
    // send an event back!
  }

  // private handleEvent(socket: Socket, event: ClientEvent) {
  //   switch (event.type) {
  //     case "join-game":
  //       this.handleJoinGame(socket, event.data)
  //       break
  //     default:
  //       console.warn("Unhandled event type:", event.type)
  //   }
  // }
}
