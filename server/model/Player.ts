import { ActionCardRegistry } from "./decks/ActionDeck"
import { IActionCard } from "./decks/cards/ActionCard"
import { GameModel, InvalidActionError } from "./GameModel"

export type PlayerId = String

export class Player {
  private cards: Set<string> // TODO: Maybe make this a card name type, make it so a card with a name can only come from the card registry

  constructor(cards: Set<string>) {
    this.cards = cards
  }

  giveCard(card: string) { 
    this.cards.add(card)
  }

  getHand(): Set<string> {
    return new Set([...this.cards])
  }

  playCard(card: string, game: GameModel, cardData: object): object {
    if (this.cards.has(card)) {
      throw new InvalidActionError("You do not have this card!")
    }
    return ActionCardRegistry[card].play(game, cardData)
  }
}
