import { Deck } from "./Deck"
import { GameModel } from "../GameModel"
import { actionDeckConfig } from "../../utils"
import { ActionCardInput, ActionCardResult } from "../../../shared/src/ActionCards"

export type ActionCardName = string
export const ActionCardRegistry: Map<ActionCardName, IActionCard> = new Map()

export class ActionDeck extends Deck<IActionCard> {
  constructor() {
    super(ActionCardRegistry, actionDeckConfig)
  }
}

export interface IActionCard {
  name: ActionCardName

  play(game: GameModel, cardData: ActionCardInput): ActionCardResult
}


class Peek implements IActionCard {
  name = "peek"

  play(game: GameModel, cardData: ActionCardInput): ActionCardResult {
    return game.chambers.get(cardData)
  }
}