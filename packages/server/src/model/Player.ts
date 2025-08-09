import { ActionCardInput, ActionCardResult } from "@smoke-and-lead/shared/src/ActionCards"
import { ActionCardName } from "./decks/ActionDeck"
import { ActionCard } from "./decks/ActionDeck"
import { GameModel, InvalidActionError } from "./GameModel"

export type PlayerId = String

export class Player {
  private cards: Map<ActionCardName, ActionCard> = new Map()

  giveCard(card: ActionCard) {
    this.cards.set(card.name, card)
  }

  getHand(): ActionCardName[] {
    return Array.from(this.cards.keys())
  }

  playCard(cardName: ActionCardName, game: GameModel, cardData: ActionCardInput): ActionCardResult {
    const card = this.cards.get(cardName)
    if (card === undefined) {
      throw new InvalidActionError("You do not have this card!")
    }
    return card.play(game, cardData)
  }
}
