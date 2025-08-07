import { shuffleArray } from "../../utils"
import { ActionCard } from "./ActionDeck"

export class Deck<TCard extends Object> {
  private deck: TCard[] = []

  constructor(allCards: TCard[], deckConfig: Record<string, number>) {
    for (let cardName of allCards) {
      for (let _ = 0; _ < deckConfig[cardName.toString()]; _++) {
        this.deck.push(cardName)
      }
    }
  }

  drawCard(): TCard {
    const card = this.deck.pop()
    if (card === undefined) {
        console.log("Attempted to draw card from an empty deck.")
        throw new Error("Attempted to draw card from the empty deck.")
    }
    return card
  }

  isEmpty(): boolean {
    return this.deck.length == 0
  }

  restock(discards: TCard[]) {
    this.deck = shuffleArray(discards)
  }
}
