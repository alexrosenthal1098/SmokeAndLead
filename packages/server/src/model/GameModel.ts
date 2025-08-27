// src/Game.ts
import { Player, PlayerId } from "./Player"
import { BulletDeck, Bullet } from "./decks/BulletDeck"
import { TrickName, TrickDeck, Trick, TrickPlayed } from "./decks/Tricks/TrickDeck"
import { shuffleArray } from "../utils"
import { GameInfo, PersonalInfo, TrickInput, TrickResult } from "@smoke-and-lead/shared"
import { Trigger } from "./decks/Tricks/Trigger"

export class GameModel {
  trickDeck: TrickDeck = new TrickDeck()
  trickDiscards: Trick[] = []
  bulletDeck: BulletDeck = new BulletDeck()

  chambers: Map<number, Bullet> = new Map()
  players: Map<PlayerId, Player> = new Map()
  playerOrder: PlayerId[]
  currentTurn: number = 0 // Index of player in playerOrder

  shooter!: PlayerId // Only assign the shooter after the first turn (if shooter is null)
  latestRoll: number = 1

  constructor(players: PlayerId[]) {
    if (players.length !== 6) {
      throw new Error("Not enough player's in the lobby.")
    }
    this.playerOrder = shuffleArray(players)

    this.initPlayerHands()
    this.initChambers()
  }

  // General events
  leaveGame(playerId: PlayerId): boolean {
    if (this.players.has(playerId)) {
      // This should handle the following things (at least)
      // - Ending the turn if its this player's turn
      // - Marking this player as "dead"
      // - Removing this player from playerOrder and players
      return true
    }
    return false
  }

  killAtChamber(chamber: number): PlayerId | undefined {
    for (const player of this.players.values()) {
      if (player.chamber === chamber && player.isAlive) {
        this.trickDiscards.push(...player.kill())
        return player.playerId
      }
    }
    return undefined
  }

  // Mid-game events
  endTurn(playerId: PlayerId): TrickPlayed | undefined {
    this.assertYourTurn(playerId)
    let result = undefined
    if (this.shooter === undefined) {
      this.shooter = playerId
    }
    else if (this.shooter === playerId) {
      result = new Trigger().play(this, {type: "trigger", data: {}})
    }

    this.players.get(playerId)!.discardInPlay()
    this.currentTurn = this.currentTurn + (1 % this.playerOrder.length)

    return result
  }

  playCard(playerId: PlayerId, cardName: TrickName, cardInput: TrickInput): TrickPlayed {
    this.assertYourTurn(playerId)
    const playerHand = this.players.get(playerId)
    if (playerHand === undefined) {
      throw new Error("You are not in the game!")
    }
    return playerHand.playCard(cardName, this, cardInput)
  }

  // retrieving game information
  getGameInfo(playerId?: PlayerId): GameInfo {
    return {
      latestRoll: this.latestRoll,
      currentTurn: this.playerOrder[this.currentTurn],
      shooter: this.shooter,
      personalInfo: playerId !== undefined ? this.getPersonalInfo(playerId) : undefined,
      trickDeckSize: this.trickDeck.size(),
      bulletDeckSize: this.bulletDeck.size(),
      playersInfo: Array.from(this.players.values(), (player) => player.getPublicInfo()),
      chambersInfo: new Map(Array.from(this.chambers.entries(), (entry) => [entry[0], entry[1].getDescription()])),
    }
  }

  getPersonalInfo(playerId: PlayerId): PersonalInfo | undefined {
    let callingPlayer = this.players.get(playerId)
    return callingPlayer !== undefined ? { hand: callingPlayer!.getHand() } : undefined
  }

  // Initialize game state
  private initPlayerHands() {
    for (const [i, playerId] of this.playerOrder.entries()) {
      const player = new Player(playerId, i + 1)
      for (let _ = 0; _ < 3; _++) {
        player.giveCard(this.trickDeck.drawCard())
      }
      this.players.set(playerId, player)
    }
  }

  private initChambers() {
    for (let i = 1; i <= 6; i++) {
      this.chambers.set(i, this.bulletDeck.drawCard())
    }
  }

  // Check game state
  private assertYourTurn(playerId: PlayerId) {
    if (playerId !== this.playerOrder[this.currentTurn]) {
      throw new Error("It is not your turn!")
    }
  }
}
