// src/Game.ts
import { EventEmitter } from "events"
import { Player, PlayerId } from "./Player"
import { IActionCard } from "./decks/cards/ActionCard"
import { IRoundCard } from "./decks/cards/RoundCard"
import { ActionDeck } from "./decks/ActionDeck"
import { RoundsDeck } from "./decks/RoundsDeck"
import { shuffleArray } from "../utils"

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
  private playerHands: Map<PlayerId, Player> = new Map()

  private actionDeck: ActionDeck = new ActionDeck()
  private roundsDeck: RoundsDeck = new RoundsDeck()
  private actionDiscards: IActionCard[] = []
  private chambers: Map<number, IRoundCard> = new Map()

  private currentTurn: number = 0 // Index of player in activePlayers
  private shooter!: PlayerId

  private isStarted: boolean = false
  private isFirstRound: boolean = true

  // "shooter" logic: when a player ends their turn we'll check if they are the shooter and it is not first round
  // "isFirstRound" logic: when a player ends their turn, if it is the first round we will check whether

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
      for (var _ = 0; _ < 3; _++) {
        this.playerHands.get(playerId)?.giveCard(this.actionDeck.drawCard())
      }
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
  }

  playCard(playerId: PlayerId, cardName: string, cardData: object) {
    this.assertIsStartedState(true)
    this.assertYourTurn(playerId)
    this.playerHands.get(playerId)?.playCard(cardName, this, cardData)
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
