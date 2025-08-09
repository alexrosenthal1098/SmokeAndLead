import { Server } from "socket.io";
import { GameModel } from "../model/GameModel";

interface GameJoinedPayload {
  playerId: string
}

type EventMap = {
  gameJoined: GameJoinedPayload
};

export class GameEventForwarder {
  private handlers: {
    [K in keyof EventMap]: (data: EventMap[K]) => void;
  };

  constructor(private io: Server, private game: GameModel, private roomId: string) {
    this.handlers = {
      gameJoined: this.handleGameJoined.bind(this),
    };

    this.registerHandlers();
  }

  private registerHandlers() {
    for (const eventName in this.handlers) {
      this.game.on(eventName, this.handlers[eventName as keyof EventMap]);
    }
  }

  // Event Handlers

  private handleGameJoined(data: GameJoinedPayload) {
    console.log(`[OUT: gameJoined] Game {${this.roomId}} accepted player {${data.playerId}}`);
    this.io.sockets.sockets.get(data.playerId)?.emit("gameJoined")
  }
}