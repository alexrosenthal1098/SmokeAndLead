// src/GameManager.ts
import { GameModel } from "./model/GameModel"
import { PlayerId } from "./model/Player"

type GameId = string

class GameManager {
  private games = new Map<GameId, GameModel>()
  private passwords = new Map<GameId, string>()
  // no need to track players-to-games because the playerEventHandler will get the socket's room ID and pass
  // that along as the game ID

  constructor() {}

  createGame(hostId: PlayerId): string {
    const gameId = generateUniqueId()
    const game = new GameModel(hostId)
    this.games.set(gameId, game)

    // Also: Create a GameEventHandler and assign it the GameModel

    // Add callbacks to a shutdown event so the game and its players can be removed from state

    return gameId
  }

  getGame(gameId: string): GameModel | undefined {
    return this.games.get(gameId)
  }

  getGameForPlayer(playerId: string): GameModel | undefined {
    const gameId = this.playerToGame.get(playerId)
    return gameId ? this.games.get(gameId) : undefined
  }

  assignPlayerToGame(playerId: string, gameId: string): boolean {
    const game = this.games.get(gameId)
    if (!game) return false
    game.addPlayer(playerId)
    this.playerToGame.set(playerId, gameId)
    return true
  }

  removePlayer(playerId: string) {
    const gameId = this.playerToGame.get(playerId)
    if (gameId) {
      const game = this.games.get(gameId)
      game?.removePlayer(playerId)
      this.playerToGame.delete(playerId)
    }
  }
}

function generateUniqueId(): string {
  // TODO: UUID library
  return Math.random().toString(36).substring(2, 10)
}

export const gameManager = new GameManager()
