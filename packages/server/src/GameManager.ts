import { GameModel } from "./model/GameModel"
import { Lobby } from "./model/Lobby"
import { PlayerId } from "./model/Player"

export type GameId = string

class GameManager {
  private games: Map<GameId, GameModel> = new Map()
  private lobbies: Map<GameId, Lobby> = new Map()
  private passwords: Map<GameId, string> = new Map() // This can be stored in the Lobby object

  // Game management
  createLobby(hostId: PlayerId, gameId: GameId, password: string): void {
    this.lobbies.set(gameId, new Lobby(hostId, password))
  }

  getGame(gameId: GameId): GameModel | undefined {
    return this.games.get(gameId)
  }

  // joinGame(playerId: PlayerId, gameId: GameId, password: string): GameId {
  //   if (!this.games.has(gameId)) {
  //     throw new Exception
  //   }
  // }
}

export const gameManager = new GameManager()
