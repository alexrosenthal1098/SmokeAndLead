import { Character, LobbyInfo } from "@smoke-and-lead/shared"
import { GameModel } from "./GameModel"
import { PlayerId } from "./Player"
import { sessionManager } from "../SessionManager"
import { GameId } from "../GameManager"

export class Lobby {
  private players: Map<PlayerId, Character> = new Map()
  private spectators: Set<PlayerId> = new Set()
  private game?: GameModel

  constructor(public hostId: PlayerId, private gameId: GameId, private password: string) {
    this.players.set(hostId, "None")
  }

  isStarted(): boolean {
    return this.game !== undefined
  }

  joinLobby(playerId: PlayerId, password: string): boolean {
    // Returns whether they joined as a player (true) or spectator (false)
    if (password === this.password) {
      throw new Error("Incorrect password!")
    }

    if (this.players.size <= 6) {
      this.players.set(playerId, "None") // TODO: add Characters
      return true
    } else {
      this.spectators.add(playerId)
      return false
    }
  }

  stopSpectating(playerId: PlayerId): boolean {
    return this.spectators.delete(playerId)
  }

  leaveLobby(playerId: PlayerId): boolean | undefined {
    if (this.isStarted() || !this.players.has(playerId)) return undefined

    this.players.delete(playerId)

    if (playerId === this.hostId) {
      this.hostId = this.players.entries().next().value![0]
      return true
    } else return false
  }

  startGame(hostId: PlayerId): GameModel {
    if (hostId !== this.hostId) {
      throw new Error("You are not the lobby's host!")
    } else if (this.isStarted()) {
      throw new Error("The game has already started!")
    }
    this.game = new GameModel(Array.from(this.players.keys()))
    for (const playerId of this.players.keys()) {
      sessionManager.updateSessionInfo(playerId, this.gameId, true)
    }
    for (const spectatorId of this.spectators.keys()) {
      sessionManager.updateSessionInfo(spectatorId, this.gameId, true)
    }
    
    return this.game
  }

  getLobbyInfo(): LobbyInfo {
    return {
      host: this.hostId,
      allPlayers: Array.from(this.players),
      numSpectators: this.spectators.size,
    }
  }

  getGame(playerId: PlayerId): GameModel | undefined {
    if (!this.players.has(playerId) && !this.spectators.has(playerId)) {
      return undefined
    }
    return this.game
  }
}
