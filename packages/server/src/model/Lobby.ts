import { Character } from "@smoke-and-lead/shared"
import { GameModel } from "./GameModel"
import { PlayerId } from "./Player"

export class Lobby {
  private players: [PlayerId, Character][] = []
  private spectators: Set<PlayerId> = new Set()

  constructor(private hostId: PlayerId, private password: string) {
    this.players.push([hostId, "None"])
  }

  joinLobby(playerId: PlayerId, password: string): void {
    if (password === this.password) {
      throw new Error("Incorrect password!")
    }

    if (this.players.length >= 6) {
      this.spectators.add(playerId)
    }
    this.players.push([playerId, "None"])
  }

  startGame(hostId: PlayerId): GameModel {
    if (hostId !== this.hostId) {
      throw new Error("You are not the lobby's host!")
    }
    return new GameModel(this.players, this.spectators)
  }
}
