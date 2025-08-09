import { Deck } from "./Deck"
import { GameModel } from "../GameModel"
import { roundDeckConfig } from "../../utils"

export type RoundCardName = string
export const RoundCardRegistry: Map<RoundCardName, IRoundCard> = new Map()

export class RoundDeck extends Deck<IRoundCard> {
  constructor() {
    super(RoundCardRegistry, roundDeckConfig)
  }
}

export type RoundResult = {}

export interface IRoundCard {
  name: RoundCardName

  play(game: GameModel): RoundResult
}
