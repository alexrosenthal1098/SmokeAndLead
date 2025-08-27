import { PublicPlayerInfo, TrickInput, TrickResult } from "@smoke-and-lead/shared"
import { TrickName, TrickPlayed } from "./decks/Tricks/TrickDeck"
import { Trick } from "./decks/Tricks/TrickDeck"
import { GameModel } from "./GameModel"

export type PlayerId = string

export class Player {
  private cards: Map<TrickName, Trick> = new Map()
  public inPlay?: TrickName
  public isAlive: boolean = true

  constructor(public playerId: string, public chamber: number) {}

  giveCard(card: Trick) {
    this.cards.set(card.name, card)
  }

  getHand(): TrickName[] {
    return Array.from(this.cards.keys())
  }

  playCard(cardName: TrickName, game: GameModel, cardInput: TrickInput): TrickPlayed {
    if (this.inPlay && this.inPlay !== cardName) {
      this.cards.delete(this.inPlay)
      this.inPlay = undefined
    }

    const card = this.cards.get(cardName)
    if (card === undefined) {
      throw new Error("You do not have this card!")
    }
    const result = card.play(game, cardInput)
    if (result.final) {
      this.cards.delete(cardName)
      this.inPlay = undefined
    } else {
      this.inPlay = cardName
    }
    return result
  }

  kill(): Trick[] {
    this.isAlive = false
    const handCopy = Array.from(this.cards.values())
    this.cards = new Map()
    return handCopy
  }

  getPublicInfo(): PublicPlayerInfo {
    return {
      playerId: this.playerId,
      cardSize: this.cards.size,
      orderNumber: this.chamber,
    }
  }

  discardInPlay(): void {
    if (this.inPlay) {
      this.cards.delete(this.inPlay)
      this.inPlay = undefined
    }
  }
}
