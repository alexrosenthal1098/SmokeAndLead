// src/Game.ts
import { Player, PlayerId } from "./Player"
import { BulletDeck, Bullet } from "./decks/Bullets"
import { TrickName, TrickDeck, Trick } from "./decks/Tricks"
import { shuffleArray } from "../utils"
import { Character, GameInfo, PlayerInfo, TrickInput, TrickResult } from "@smoke-and-lead/shared"
import { SocketEventEmitter } from "../events/ServerEventEmitter"
import { Server } from "socket.io"

export class InvalidActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidActionError"
  }
}

export class GameModel extends SocketEventEmitter {
  private playerOrder: PlayerId[]
  private spectators: Set<PlayerId>

  private currentTurn: number = 0 // Index of player in activePlayers
  private shooter!: PlayerId // Only assign the shooter after the first turn (if shooter is null)
  private latestRoll: number = 1

  trickDeck: TrickDeck = new TrickDeck()
  bulletDeck: BulletDeck = new BulletDeck()
  trickDiscards: Trick[] = []
  chambers: Map<number, Bullet> = new Map()
  players: Map<PlayerId, Player> = new Map()

  constructor(players: [PlayerId, Character][], spectators: Set<PlayerId>) {
    super()
    if (players.length != 6) {
      throw new Error("Not enough player's in the lobby.")
    }
    const shuffled = shuffleArray(players)
    this.playerOrder = shuffled.map(tuple => tuple[0])
    this.spectators = spectators

    this.initPlayerHands(shuffled.map(tuple => tuple[1]))
    this.initChambers()
  }

  // Game events
  spectateGame(playerId: PlayerId): void {
    this.spectators.add(playerId)
    // broadcast spectator-joined
    // assign player to room (upstack)
    // emit game-spectating
  }

  leaveGame(playerId: PlayerId): void {
    if (this.spectators.has(playerId)) {
      this.spectators.delete(playerId)
      // emit stopped-spectating 
      // remove socket from room (upstack)
      // broadcast spectator-left
    }
    else if (this.players.has(playerId)) {
      // This should handle the following things (at least)
      // - Ending the turn if its this player's turn
      // - Marking this player as "dead"
      // - Removing this player from the playerOrder thing
      // - 
      
      // emit left-game
      // remove socket from room (upstack)
      // broadcast player-left
    }
  }

  // Mid-game events
  endTurn(playerId: PlayerId) {
    this.assertYourTurn(playerId)
    if (this.shooter === undefined) {
      this.shooter = playerId
    }
    this.currentTurn = this.currentTurn + (1 % this.playerOrder.length)
  }

  playCard(
    playerId: PlayerId,
    cardName: TrickName,
    cardData: TrickInput
  ): TrickResult {
    this.assertYourTurn(playerId)
    const playerHand = this.players.get(playerId)
    if (playerHand === undefined) {
      throw new InvalidActionError("You are not in the game!")
    }
    return playerHand.playCard(cardName, this, cardData)
  }

  // retrieving game information
  getGameInfo(playerId: PlayerId): GameInfo {
    let callingPlayer = this.players.get(playerId)
    return {
      currentTurn: this.playerOrder[this.currentTurn],
      shooter: this.shooter,
      personalInfo: callingPlayer !== undefined ? { hand: callingPlayer!.getHand() } : undefined,
      trickDeckSize: this.trickDeck.size(),
      bulletDeckSize: this.bulletDeck.size(),
      playerInfos: Array.from(this.players.values(), player => player.getPublicInfo()),
    }
  }

    // Initialize game state
  private initPlayerHands(characters: Character[]) {
    for (const [i, playerId] of this.playerOrder.entries()) {
      const player = new Player(playerId, i+1, characters[i])
      for (let _ = 0; _ < 3; _++) {
        player.giveCard(this.trickDeck.drawCard())
      }
      this.players.set(playerId, player)
    }
  }

  private initChambers() {
    for (let i = 0; i < 6; i++) {
      this.chambers.set(i, this.bulletDeck.drawCard())
    }
  }

  // Check game state
  private assertYourTurn(playerId: PlayerId) {
    if (playerId !== this.playerOrder[this.currentTurn]) {
      throw new InvalidActionError("It is not your turn!")
    }
  }
}
