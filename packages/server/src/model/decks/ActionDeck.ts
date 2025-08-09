import { Deck } from "./Deck"
import { GameModel, InvalidActionError } from "../GameModel"
import { actionDeckConfig } from "../../utils"
import { ActionCardInput, ActionCardResult } from "@smoke-and-lead/shared"

export type ActionCardName = string

export class ActionDeck extends Deck<IActionCard> {
  constructor() {
    super(ActionCardRegistry, actionDeckConfig)
  }
}

export interface IActionCard {
  name: ActionCardName

  play(game: GameModel, cardData: ActionCardInput): ActionCardResult
}

export class Peek implements IActionCard {
  name = "peek"

  play(game: GameModel, cardData: ActionCardInput): ActionCardResult {
    switch (cardData.type) {
      case "peek":
        const round = game.chambers.get(cardData.chamber)
        if (round === undefined) {
          throw new Error("Invalid chamber given")
        }
        return { round: round.name }
      default:
        throw new Error("Invalid chamber given")
    }
  }
}

export const ActionCardRegistry: Map<ActionCardName, IActionCard> = new Map([
  ["peek", new Peek()],
])