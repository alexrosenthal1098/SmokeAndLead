// src/Game.ts
import { Player, PlayerId } from "./Player"
import { BulletDeck, Bullet } from "./decks/Bullets"
import { TrickName, TrickDeck, Trick } from "./decks/Tricks"
import { shuffleArray } from "../utils"
import { TrickInput, TrickResult } from "@smoke-and-lead/shared"
import { SocketEventEmitter } from "../events/ServerEventEmitter"
import { Server } from "socket.io"

export class InvalidActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidActionError"
  }
}

export class GameModel extends SocketEventEmitter {
  private hostId: PlayerId
  private playerOrder: PlayerId[] = [] // Will keep track of the order of players, it will be shuffled on game start
  private spectators: Set<PlayerId> = new Set()

  private isStarted: boolean = false
  private currentTurn: number = 0 // Index of player in activePlayers
  private shooter!: PlayerId // Only assign the shooter after the first turn (if shooter is null)

  trickDeck: TrickDeck = new TrickDeck()
  bulletDeck: BulletDeck = new BulletDeck()
  trickDiscards: Trick[] = []
  chambers: Map<number, Bullet> = new Map()
  players: Map<PlayerId, Player> = new Map()

  constructor(io: Server, hostId: PlayerId) {
    super(io)
    this.hostId = hostId
    this.playerOrder.push(hostId)
  }

  // Game events
  joinGame(playerId: PlayerId) {
    if (this.isStarted && this.playerOrder.length < 6) {
      this.playerOrder.push(playerId)
      // activePlayerJoined event
    } else {
      this.spectators.add(playerId)
      // spectatorJoined event
    }
  }

  leaveGame(playerId: PlayerId) {
    if (this.spectators.delete(playerId)) {
      // spectatorLeft event
    }
  }

  startGame(playerId: PlayerId) {
    this.assertIsHost(playerId)
    this.assertIsStartedState(false)
    if (this.playerOrder.length != 6) {
      throw new InvalidActionError("Not enough player's in the lobby.")
    }

    this.playerOrder = shuffleArray(this.playerOrder)
    this.shooter = this.playerOrder[0]
    this.initPlayerHands()
    this.initChambersDeck()

    this.isStarted = true
  }

  // Initialize game state
  private initPlayerHands() {
    for (const playerId in this.playerOrder) {
      const player = new Player()
      for (let _ = 0; _ < 3; _++) {
        player.giveCard(this.trickDeck.drawCard())
      }
      this.players.set(playerId, player)
    }
  }

  private initChambersDeck() {
    for (let i = 0; i < 6; i++) {
      this.chambers.set(i, this.bulletDeck.drawCard())
    }
  }

  // Mid-game events
  nextTurn(playerId: PlayerId) {
    this.assertIsStartedState(true)
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
    this.assertIsStartedState(true)
    this.assertYourTurn(playerId)
    const playerHand = this.players.get(playerId)
    if (playerHand === undefined) {
      throw new InvalidActionError("You are not in the game!")
    }
    return playerHand.playCard(cardName, this, cardData)
  }

  // Check game state
  private assertIsStartedState(desired: boolean) {
    if (this.isStarted != desired) {
      throw new InvalidActionError(
        `The game must ${desired ? "be" : "not be"} started.`
      )
    }
  }

  private assertIsHost(playerId: PlayerId) {
    if (playerId !== this.hostId) {
      throw new InvalidActionError("You are not the host!")
    }
  }

  private assertYourTurn(playerId: PlayerId) {
    if (playerId !== this.playerOrder[this.currentTurn]) {
      throw new InvalidActionError("It is not your turn!")
    }
  }
}
