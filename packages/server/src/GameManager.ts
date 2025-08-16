import { GameModel } from "./model/GameModel"
import { Lobby } from "./model/Lobby"
import { PlayerId } from "./model/Player"

export type GameId = string

class LobbyManager {
  private lobbies: Map<GameId, Lobby> = new Map()

  // Game management
  createLobby(hostId: PlayerId, gameId: GameId, password: string): boolean {
    // Returns whether the lobby was created or not
    if (this.lobbies.has(gameId)) {
      return false
    }
    this.lobbies.set(gameId, new Lobby(hostId, gameId, password))
    return true
  }

  getLobby(gameId: GameId): Lobby | undefined {
    return this.lobbies.get(gameId)
  }
}

export const gameManager = new LobbyManager()
