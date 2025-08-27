// ClientEventHandler.ts
import { Socket } from "socket.io"
import { GameId, gameManager } from "./GameManager"
import { sessionManager } from "./SessionManager"
import { PlayerId } from "@smoke-and-lead/server/src/model/Player"
import { ClientEvent, ExtractEventData } from "@smoke-and-lead/shared"
import { io } from "./server"
import { TrickPlayed, TrickName } from "./model/decks/Tricks/TrickDeck"

function UpdateSessionActivity(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value
  descriptor.value = function (this: { playerId: PlayerId }, ...args: any[]) {
    sessionManager.updateActivity(this.playerId)
    return original.apply(this, args)
  }
}

export class ClientEventHandler {
  constructor(private socket: Socket, private playerId: PlayerId) {
    this.socket = socket
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.socket.on("create-lobby", (data) => this.createLobby(data))
    this.socket.on("join-game", (data) => this.handleJoinGame(data))
    this.socket.on("request-game-info", (data) => this.requestGameInfo(data))
    this.socket.on("stop-spectating", (data) => this.stopSpectating(data))
    this.socket.on("leave-lobby", (data) => this.leaveLobby(data))
    this.socket.on("start-game", (data) => this.startGame(data))
    this.socket.on("leave-game", (data) => this.leaveGame(data))
    this.socket.on("play-card", (data) => this.playCard(data))
    this.socket.on("end-turn", (data) => this.endTurn(data))
  }

  // Specific event handlers

  @UpdateSessionActivity
  private createLobby(data: ExtractEventData<ClientEvent, "create-lobby">): void {
    if (gameManager.createLobby(this.playerId, data.gameId, data.password)) {
      this.socket.emit("lobby-created")
      sessionManager.updateSessionInfo(this.playerId, data.gameId, false)
    } else {
      this.socket.emit("error", { reason: "Game name taken." })
    }
  }

  @UpdateSessionActivity
  private handleJoinGame(data: ExtractEventData<ClientEvent, "join-game">): void {
    const lobby = gameManager.getLobby(data.gameId)
    if (lobby === undefined) {
      this.socket.emit("error", { reason: "Game name does not exist!" })
    } else {
      try {
        let isStarted = false
        if (lobby.joinLobby(this.playerId, data.password)) {
          this.socket.emit("lobby-joined", lobby.getLobbyInfo())
          this.socket.to(data.gameId).emit("player-joined", { player: this.playerId, character: "None" })
        } else {
          if (lobby.isStarted()) {
            const gameInfo = lobby.getGame(this.playerId)?.getGameInfo()
            this.socket.emit("game-spectating", gameInfo)
            let isStarted = true
          } else {
            this.socket.emit("lobby-spectating", lobby.getLobbyInfo())
          }
          this.socket.to(data.gameId).emit("spectator-joined", { player: this.playerId })
        }
        this.socket.join(data.gameId)
        sessionManager.updateSessionInfo(this.playerId, data.gameId, isStarted)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        this.socket.emit("error", { reason: message })
      }
    }
  }

  @UpdateSessionActivity
  private requestGameInfo(data: ExtractEventData<ClientEvent, "request-game-info">): void {
    const game = gameManager.getLobby(data.gameId)?.getGame(this.playerId)
    if (game === undefined) {
      this.socket.emit("error", { reason: "Game not found." })
    } else {
      this.socket.emit("game-info", game.getGameInfo(this.playerId))
    }
  }

  @UpdateSessionActivity
  private stopSpectating(data: ExtractEventData<ClientEvent, "stop-spectating">): void {
    if (gameManager.getLobby(data.gameId)?.stopSpectating(this.playerId)) {
      this.socket.emit("stopped-spectating")
      this.socket.leave(data.gameId)
      this.socket.to(data.gameId).emit("sectator-left", { player: this.playerId })
      sessionManager.updateSessionInfo(this.playerId, undefined, undefined)
    }
  }

  @UpdateSessionActivity
  // Only for players, not spectators
  private leaveLobby(data: ExtractEventData<ClientEvent, "leave-lobby">): void {
    const lobby = gameManager.getLobby(data.gameId)
    const leaveResult = lobby?.leaveLobby(this.playerId)
    if (leaveResult === undefined) return

    this.socket.emit("left-lobby")
    this.socket.leave(data.gameId)
    this.socket.to(data.gameId).emit("player-left", { player: this.playerId })

    if (leaveResult) this.socket.to(data.gameId).emit("new-host", { host: lobby!.hostId })

    sessionManager.updateSessionInfo(this.playerId, undefined, undefined)
  }

  @UpdateSessionActivity
  private startGame(data: ExtractEventData<ClientEvent, "start-game">): void {
    try {
      const lobby = gameManager.getLobby(data.gameId)
      if (lobby) {
        const game = lobby.startGame(this.playerId)
        const gameInfo = game.getGameInfo()
        io.to(data.gameId).emit("game-started", gameInfo)
        gameInfo.playersInfo.forEach((info) => {
          const socket = sessionManager.getSession(info.playerId)?.socket
          if (socket !== undefined) socket.emit("personal-info", game!.getPersonalInfo(info.playerId))
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.socket.emit("error", { reason: message })
    }
  }

  @UpdateSessionActivity
  private leaveGame(data: ExtractEventData<ClientEvent, "leave-game">): void {
    if (gameManager.getLobby(data.gameId)?.getGame(this.playerId)?.leaveGame(this.playerId)) {
      this.socket.emit("left-game")
      this.socket.to("player-left")
      this.socket.leave(data.gameId)
      sessionManager.updateSessionInfo(this.playerId, undefined, undefined)
    }
  }

  @UpdateSessionActivity
  private playCard(data: ExtractEventData<ClientEvent, "play-card">): void {
    const game = gameManager.getLobby(data.gameId)?.getGame(this.playerId)
    if (game) {
      const result = game.playCard(this.playerId, data.cardInput.type, data.cardInput)
      this.emitTrickPlayedResult(result, data.gameId, data.cardInput.type)
    }
  }

  @UpdateSessionActivity
  private endTurn(data: ExtractEventData<ClientEvent, "end-turn">): void {
    const game = gameManager.getLobby(data.gameId)?.getGame(this.playerId)
    if (game) {
      const result = game.endTurn(this.playerId)
      if (result) {
        this.emitTrickPlayedResult(result, data.gameId)
      }
      io.to(data.gameId).emit("next-turn", { playerId: game })
    }
  }

  private emitTrickPlayedResult(trickPlayed: TrickPlayed, gameId: GameId, cardPlayed?: TrickName): void {
    if (trickPlayed.final && cardPlayed) {
      io.to(gameId).emit("card-played", { player: this.playerId, cardName: cardPlayed })
    }

    for (const event of trickPlayed.personalEvents) {
      this.socket.emit(event.type, event.data)
    }
    for (const event of trickPlayed.publicEvents) {
      io.to(gameId).emit(event.type, event.data)
    }

    if (trickPlayed.otherPlayerEvents) {
      for (const [playerId, event] of trickPlayed.otherPlayerEvents) {
        const socket = sessionManager.getSession(playerId)?.socket
        if (socket !== undefined) socket.emit(event.type, event.data)
      }
    }
  }
}
