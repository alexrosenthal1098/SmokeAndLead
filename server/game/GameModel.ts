// src/Game.ts
import { EventEmitter } from "events";

export type GameEventType = 
  | "playerJoined"
  | "playerLeft"
  | "cardPlayed"
  | "gameUpdated";

export class GameModel extends EventEmitter {
  private players: Set<string> = new Set();
  private gameId: string;
  private state: any = {}; // Replace with real game state

  constructor(gameId: string) {
    super();
    this.gameId = gameId;
  }

  addPlayer(playerId: string) {
    this.players.add(playerId);
    this.emit("playerJoined", { playerId });
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
    this.emit("playerLeft", { playerId });
  }

  handleAction(playerId: string, action: any) {
    // Validate and apply action
    this.emit("cardPlayed", { playerId, action });

    // Update internal state
    this.emit("gameUpdated", {
      playerStates: this.getFilteredStates(),
    });
  }

  getFilteredStates(): Record<string, any> {
    const views: Record<string, any> = {};
    for (const playerId of this.players) {
      views[playerId] = this.getClientView(playerId);
    }
    return views;
  }

  getClientView(playerId: string): any {
    // Return a filtered version of the game state for this player
    return {
      hand: ["Card A", "Card B"], // mock
      yourTurn: true,
    };
  }
}
