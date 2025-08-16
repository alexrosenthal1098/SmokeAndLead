import { PublicPlayerInfo, TrickInput, TrickResult } from "@smoke-and-lead/shared"
import { TrickName } from "./decks/Tricks"
import { Trick } from "./decks/Tricks"
import { GameModel, InvalidActionError } from "./GameModel"

export type PlayerId = string

export class Player {
  private cards: Map<TrickName, Trick> = new Map()

  constructor(private playerId: string, private chamber: number) {}

  giveCard(card: Trick) {
    this.cards.set(card.name, card)
  }

  getHand(): TrickName[] {
    return Array.from(this.cards.keys())
  }

  playCard(cardName: TrickName, game: GameModel, cardData: TrickInput): TrickResult {
    const card = this.cards.get(cardName)
    if (card === undefined) {
      throw new InvalidActionError("You do not have this card!")
    }
    return card.play(game, cardData)
  }

  getPublicInfo(): PublicPlayerInfo {
    return {
      playerId: this.playerId,
      cardSize: this.cards.size,
      orderNumber: this.chamber,
    }
  }
}
