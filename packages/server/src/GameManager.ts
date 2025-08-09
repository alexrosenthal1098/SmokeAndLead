import { GameModel } from "./model/GameModel"
import { PlayerId } from "./model/Player"
import { io } from "./server"

export type GameId = string

class GameManager {
  private games: Map<GameId, GameModel> = new Map()
  private passwords: Map<GameId, string> = new Map()
  private playerGames: Map<PlayerId, GameId> = new Map()

  // Game management
  createGame(hostId: PlayerId, gameId: GameId, password: string): void {
    const gameModel = new GameModel(io, hostId)
    this.games.set(gameId, gameModel)
  }
}

export const gameManager = new GameManager()
