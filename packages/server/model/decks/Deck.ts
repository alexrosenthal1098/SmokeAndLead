import { shuffleArray } from "../../utils"

export class Deck<TCard extends Object> {
  private deck: TCard[] = []

  constructor(cardRegistry: Map<string, TCard>, deckConfig: Record<string, number>) {
    for (let cardName of cardRegistry.keys()) {
      for (let _ = 0; _ < deckConfig[cardName.toString()]; _++) {
        const cardObject = cardRegistry.get(cardName)
        if (cardObject === undefined) {
          throw new Error("Bad card registry")
        }
        this.deck.push(cardObject)
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
