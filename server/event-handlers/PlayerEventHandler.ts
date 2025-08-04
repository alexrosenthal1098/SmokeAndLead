// src/PlayerEventHandler.ts
import { Socket } from "socket.io";
import { GameManager } from "./GameManager";

export class PlayerEventHandler {
  private playerId: string;

  constructor(private socket: Socket) {
    this.playerId = generateUniqueId();
    this.registerHandlers();
  }

  private registerHandlers() {
    const gameManager = GameManager.getInstance();

    this.socket.on("createGame", () => {
      const gameId = gameManager.createGame(this.playerId);
      this.socket.join(gameId);
      this.socket.emit("gameCreated", { gameId });
    });

    this.socket.on("joinGame", ({ gameId }) => {
      const success = gameManager.assignPlayerToGame(this.playerId, gameId);
      if (success) {
        this.socket.join(gameId);
        this.socket.emit("gameJoined", { gameId });
      } else {
        this.socket.emit("error", { message: "Game not found" });
      }
    });

    this.socket.on("playerAction", (action) => {
      const game = gameManager.getGameForPlayer(this.playerId);
      if (game) {
        game.handleAction(this.playerId, action);
      } else {
        this.socket.emit("error", { message: "You are not in a game" });
      }
    });

    this.socket.on("disconnect", () => {
      gameManager.removePlayer(this.playerId);
    });
  }
}

function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 10);
}
