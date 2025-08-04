// src/GameManager.ts
import { GameModel } from "./GameModel";

class GameManager {
  private games = new Map<string, GameModel>();
  // no need to track players-to-games because the playerEventHandler will get the socket's room ID and pass
  // that along as the game ID

  constructor() {}

  createGame(playerId: string): string {
    const gameId = generateUniqueId();
    const game = new GameModel(gameId);
    this.games.set(gameId, game);
    this.playerToGame.set(playerId, gameId);
    game.addPlayer(playerId);

    // Also: Create a GameEventHandler and assign it the GameModel

    // Add callbacks to a shutdown event so the game and its players can be removed from state

    return gameId;
  }

  getGame(gameId: string): GameModel | undefined {
    return this.games.get(gameId);
  }

  getGameForPlayer(playerId: string): GameModel | undefined {
    const gameId = this.playerToGame.get(playerId);
    return gameId ? this.games.get(gameId) : undefined;
  }

  assignPlayerToGame(playerId: string, gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;
    game.addPlayer(playerId);
    this.playerToGame.set(playerId, gameId);
    return true;
  }

  removePlayer(playerId: string) {
    const gameId = this.playerToGame.get(playerId);
    if (gameId) {
      const game = this.games.get(gameId);
      game?.removePlayer(playerId);
      this.playerToGame.delete(playerId);
    }
  }
}

function generateUniqueId(): string { // TODO: UUID library
  return Math.random().toString(36).substring(2, 10);
}

export const gameManager = new GameManager()