// src/GameEventHandler.ts
import { Server } from "socket.io";
import { Game } from "./Game";

export class GameEventHandler {
  constructor(private io: Server, private game: Game, private roomId: string) {
    this.registerListeners();
  }

  private registerListeners() {
    this.game.on("playerJoined", (data) => {
      this.io.to(this.roomId).emit("game:playerJoined", data);
    });

    this.game.on("cardPlayed", (data) => {
      this.io.to(this.roomId).emit("game:cardPlayed", data);
    });

    this.game.on("gameUpdated", ({ playerStates }) => {
      for (const playerId in playerStates) {
        this.io.to(playerId).emit("game:stateUpdate", playerStates[playerId]);
      }
    });
  }
}
