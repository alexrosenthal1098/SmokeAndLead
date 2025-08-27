import { shuffleArray } from "../../utils"

export type Constructor<T> = new () => T;
export class Deck<TCard> {
  private deck: TCard[] = []

  constructor(
    cardRegistry: Map<string, Constructor<TCard>>,
    deckConfig: Record<string, number>
  ) {
    for (const cardName of cardRegistry.keys()) {
      for (let _ = 0; _ < deckConfig[cardName.toString()]; _++) {
        const CardType = cardRegistry.get(cardName)
        if (CardType === undefined) {
          throw new Error("Bad card registry")
        }
        this.deck.push(new CardType())
      }
    }
  }

  size(): number {
    return this.deck.length
  }

  drawCard(): TCard {
    const card = this.deck.pop()
    if (card === undefined) {
      console.log("Attempted to draw card from an empty deck.")
      throw new Error("Attempted to draw card from the empty deck.")
    }
    return card
  }

  restock(discards: TCard[]) {
    this.deck = shuffleArray(discards)
  }
}
