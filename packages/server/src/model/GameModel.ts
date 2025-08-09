// src/Game.ts
import { EventEmitter } from "events"
import { Player, PlayerId } from "./Player"
import { RoundDeck, IRoundCard } from "./decks/RoundDeck"
import { ActionCardName, ActionDeck, IActionCard } from "./decks/ActionDeck"
import { shuffleArray } from "../utils"
import { ActionCardInput, ActionCardResult } from "@smoke-and-lead/shared"

export class InvalidActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidActionError"
  }
}

export class GameModel extends EventEmitter {
  private hostId: PlayerId
  private activePlayers: PlayerId[] = [] // Will keep track of the order of players, it will be shuffled on game start
  private spectators: Set<PlayerId> = new Set()

  private currentTurn: number = 0 // Index of player in activePlayers
  private shooter!: PlayerId // Only assign the shooter after the first turn (if shooter is null)

  private isStarted: boolean = false
  private isFirstRound: boolean = true

  actionDeck: ActionDeck = new ActionDeck()
  roundsDeck: RoundDeck = new RoundDeck()
  actionDiscards: IActionCard[] = []
  chambers: Map<number, IRoundCard> = new Map()
  playerHands: Map<PlayerId, Player> = new Map()

  constructor(hostId: PlayerId) {
    super()
    this.hostId = hostId
    this.activePlayers.push(hostId)
  }

  // Game events
  joinGame(playerId: PlayerId) {
    if (this.isStarted && this.activePlayers.length < 6) {
      this.activePlayers.push(playerId)
      // activePlayeJoined event
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
    if (this.activePlayers.length != 6) {
      throw new InvalidActionError("Not enough player's in the lobby.")
    }

    this.activePlayers = shuffleArray(this.activePlayers)
    this.shooter = this.activePlayers[0]
    this.initPlayerHands()
    this.initChambersDeck()

    this.isStarted = true
  }

  // Initialize game state
  private initPlayerHands() {
    for (let playerId in this.activePlayers) {
      const player = new Player()
      for (var _ = 0; _ < 3; _++) {
        player.giveCard(this.actionDeck.drawCard())
      }
      this.playerHands.set(playerId, player)
    }
  }

  private initChambersDeck() {
    for (let i = 0; i < 6; i++) {
      this.chambers.set(i, this.roundsDeck.drawCard())
    }
  }

  // Mid-game events
  nextTurn(playerId: PlayerId) {
    this.assertIsStartedState(true)
    this.assertYourTurn(playerId)
    if (this.shooter === undefined) {
      this.shooter = playerId
    }
    this.currentTurn = this.currentTurn + (1 % this.activePlayers.length)
  }

  playCard(playerId: PlayerId, cardName: ActionCardName, cardData: ActionCardInput): ActionCardResult {
    this.assertIsStartedState(true)
    this.assertYourTurn(playerId)
    const playerHand = this.playerHands.get(playerId)
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
    if (playerId !== this.activePlayers[this.currentTurn]) {
      throw new InvalidActionError("It is not your turn!")
    }
  }
}
