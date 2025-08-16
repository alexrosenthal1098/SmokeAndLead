import { Deck } from "./Deck"
import { GameModel } from "../GameModel"
import { trickConfig } from "../../utils"
import {
  TrickInput,
  TrickResult,
  ExtractTrickInput,
} from "@smoke-and-lead/shared"

export type TrickName = TrickInput["type"]
export class TrickDeck extends Deck<Trick> {
  constructor() {
    super(TrickRegistry, trickConfig)
  }
}

export abstract class Trick {
  abstract readonly name: TrickName

  play(game: GameModel, cardData: TrickInput): TrickResult {
    if (cardData.type !== this.name) {
      throw new Error("Invalid card input given")
    }

    const extractedData = cardData.data as ExtractTrickInput<typeof this.name>
    this._validateData(extractedData)
    return this._play(game, extractedData)
  }

  protected abstract _validateData(
    cardData: ExtractTrickInput<typeof this.name>
  ): void
  protected abstract _play(
    game: GameModel,
    cardData: ExtractTrickInput<typeof this.name>
  ): TrickResult
}

class Peek extends Trick {
  readonly name = "peek"

  _play(
    game: GameModel,
    cardData: ExtractTrickInput<typeof this.name>
  ): TrickResult {
    const bullet = game.chambers.get(cardData.chamber)
    if (bullet === undefined) {
      throw new Error("Invalid chamber given")
    }
    return { type: "peek", data: { bullet: bullet.name } }
  }

  _validateData(cardData: ExtractTrickInput<typeof this.name>): void {
    // not implemented for now
  }
}

export const TrickRegistry: Map<TrickName, Trick> = new Map([
  ["peek", new Peek()],
])
