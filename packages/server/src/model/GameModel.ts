// src/Game.ts
import { Player, PlayerId } from "./Player"
import { BulletDeck, Bullet } from "./decks/BulletDeck"
import { TrickName, TrickDeck} from "./decks/Tricks/TrickDeck"
import { shuffleArray } from "../utils"
import { GameInfo, PersonalInfo, TrickInput, TrickResult } from "@smoke-and-lead/shared"
import { Trigger } from "./decks/Tricks/Trigger"
import { Trick, TrickPlayed } from "./decks/Tricks/Trick"

export class GameModel {
  private NUM_CARD_AT_START: number = 3
  private NUM_DRAW_PER_TURN: number = 2

  trickDeck: TrickDeck = new TrickDeck()
  trickDiscards: Trick[] = []
  bulletDeck: BulletDeck = new BulletDeck()

  chambers: Map<number, Bullet> = new Map()
  players: Map<PlayerId, Player> = new Map()
  playerOrder: PlayerId[]
  currentTurn: number = 0 // Index of player in playerOrder

  shooter!: PlayerId // Only assign the shooter after the first trigger is played
  triggeredThisTurn: boolean
  latestRoll: number = 1

  constructor(players: PlayerId[]) {
    if (players.length !== 6) {
      throw new Error("Not enough player's in the lobby.")
    }
    this.triggeredThisTurn = false
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

  trigger(): TrickPlayed {
    const curTurnPlayer = this.playerOrder[this.currentTurn]
    this.shooter = curTurnPlayer
    this.triggeredThisTurn = true
    const chamber = Math.floor(Math.random() * 6) + 1
    const bullet = this.chambers.get(chamber)!.name
    const result: TrickPlayed = {
      personalEvents: [],
      publicEvents: [],
      final: true,
    }
    result.publicEvents.push({
      type: "bullet-fired",
      data: { chamber, bullet },
    })
    switch (bullet) {
      case "bullet":
        const deadPlayer = this.killAtChamber(chamber)
        this.chambers.set(chamber, this.bulletDeck.drawCard())
        if (deadPlayer) {
          result.publicEvents.push({
            type: "player-killed",
            data: { player: deadPlayer },
          })
          if (this.playerOrder.length == 1) {
            // end the game! somebody won
            return result
          }
          else if (deadPlayer == curTurnPlayer) {
            this.currentTurn -= 1
            this._endTurnPostTrigger(deadPlayer, result)
          }
        }
        
        break
      case "blank":
        break
      default:
        throw new Error("Unkown bullet name.")
    }

    return result
  }

  killAtChamber(chamber: number): PlayerId | undefined {
    for (const player of this.players.values()) {
      if (player.chamber === chamber && player.isAlive) {
        this.trickDiscards.push(...player.kill())
        this._removeFromOrder(player.playerId)
        return player.playerId
      }
    }
    return undefined
  }
  
 private _removeFromOrder(playerId: string): void {
    const index = this.playerOrder.indexOf(playerId);
    this.playerOrder.splice(index, 1)

    if (index < this.currentTurn) {
      this.currentTurn -= 1;
    }
    if (this.currentTurn >= this.playerOrder.length) {
      this.currentTurn = 0;
    }
  }

  // Mid-game events
  endTurn(playerId: PlayerId): TrickPlayed {
    this.assertYourTurn(playerId)

    let result
    if (this.shooter === playerId && !this.triggeredThisTurn) {
      result = new Trigger().play(this, { type: "trigger", data: {} })
      if (result.otherPlayerEvents) return result
    } else {
      result = {
        personalEvents: [],
        publicEvents: [],
        final: true,
      }
    }

    this._endTurnPostTrigger(playerId, result)
    return result
  }

  private _endTurnPostTrigger(playerId: PlayerId, result: TrickPlayed): void {
    this.players.get(playerId)!.discardInPlay()
    this.currentTurn = (this.currentTurn + 1) % this.playerOrder.length

    const nextPlayer = this.players.get(this.playerOrder[this.currentTurn])!
    const cardsDrawn = []
    let card
    for (let _ = 0; _ < this.NUM_DRAW_PER_TURN; _++) {
      card = this.trickDeck.drawCard()
      nextPlayer.giveCard(card)
      cardsDrawn.push(card.name)
    }

    result.otherPlayerEvents = new Map<PlayerId, TrickResult>([[nextPlayer.playerId, { type: "cards-drawn", data: { cardsDrawn } }]])
    result.publicEvents.push({type: "next-turn", data: {playerId: nextPlayer.playerId}})
    this.triggeredThisTurn = false
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
      for (let _ = 0; _ < this.NUM_CARD_AT_START; _++) {
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

  // Misc
  private assertYourTurn(playerId: PlayerId) {
    if (playerId !== this.playerOrder[this.currentTurn]) {
      throw new Error("It is not your turn!")
    }
  }
}
