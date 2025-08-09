import { ActionCardName } from "./decks/ActionDeck"
import { IActionCard } from "./decks/ActionDeck"
import { GameModel, InvalidActionError } from "./GameModel"

export type PlayerId = String

export class Player {
  private cards: Map<ActionCardName, IActionCard> = new Map()

  giveCard(card: IActionCard) {
    this.cards.set(card.name, card)
  }

  getHand(): ActionCardName[] {
    return Array.from(this.cards.keys())
  }

  playCard(
    cardName: ActionCardName,
    game: GameModel,
    cardData: object
  ): object {
    const card = this.cards.get(cardName)
    if (card === undefined) {
      throw new InvalidActionError("You do not have this card!")
    }
    return card.play(game, cardData)
  }
}
