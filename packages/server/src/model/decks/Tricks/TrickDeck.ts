import { Constructor, Deck } from "../Deck"
import { GameModel } from "../../GameModel"
import { trickConfig } from "../../../utils"
import {
  TrickInput,
  TrickResult,
  ExtractTrickInput,
} from "@smoke-and-lead/shared"
import { Peek } from "./Peek"
import { PlayerId } from "../../Player"

export type TrickName = TrickInput["type"]
export class TrickDeck extends Deck<Trick> {
  constructor() {
    super(TrickRegistry, trickConfig)
  }
}

export type TrickPlayed = {
  personalEvents: TrickResult[],
  publicEvents: TrickResult[],
  final: boolean,
  otherPlayerEvents?: Map<PlayerId, TrickResult>,
}

export abstract class Trick {
  abstract readonly name: TrickName
  abstract inPlay: boolean

  play(game: GameModel, cardInput: TrickInput): TrickPlayed {
    if (cardInput.type !== this.name) {
      throw new Error("Invalid card input given")
    }

    return this._play(game, cardInput.data)
  }

  protected abstract _play(
    game: GameModel,
    cardInput: ExtractTrickInput<typeof this.name>
  ): TrickPlayed
}

export const TrickRegistry: Map<TrickName, Constructor<Trick>> = new Map([
  ["peek", Peek],
])
