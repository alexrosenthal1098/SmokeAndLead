import { Deck } from "./Deck"
import { GameModel } from "../GameModel"
import { actionDeckConfig } from "../../utils"
import { ActionCardInput, ActionCardResult, ExtractCardData } from "@smoke-and-lead/shared/src/ActionCards"

export type ActionCardName = ActionCardInput['type']

export class ActionDeck extends Deck<ActionCard> {
  constructor() {
    super(ActionCardRegistry, actionDeckConfig)
  }
}

type ExtractedCardData<T extends ActionCardInput['type']> = ExtractCardData<ActionCardInput, T>;

export abstract class ActionCard {
  readonly abstract name: ActionCardInput['type']

  play(game: GameModel, cardData: ActionCardInput): ActionCardResult {
    if (cardData.type != this.name) {
      throw new Error ("Invalid card input given")
    }
    
    const extractedData = cardData.data as ExtractedCardData<typeof this.name>;
    this._validateData(extractedData)
    return this._play(game, extractedData)
  }

  protected abstract _validateData(cardData: ExtractedCardData<typeof this.name>): void
  protected abstract _play(game: GameModel, cardData: ExtractedCardData<typeof this.name>): ActionCardResult
}

class Peek extends ActionCard {
  readonly name = "peek"

  _play(game: GameModel, cardData: ExtractedCardData<typeof this.name>): ActionCardResult {
    const round = game.chambers.get(cardData.chamber)
    if (round === undefined) {
      throw new Error("Invalid chamber given")
    }
    return { type: 'peek', data: { round: round.name } }
  }

  _validateData(cardData: ExtractedCardData<typeof this.name>): void {
    // not implemented for now
  }
}

export const ActionCardRegistry: Map<ActionCardName, ActionCard> = new Map([
  ["peek", new Peek()],
])