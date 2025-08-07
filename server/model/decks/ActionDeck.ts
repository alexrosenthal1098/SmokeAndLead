import { Deck } from "./Deck"
import { IActionCard } from "./cards/ActionCard"
import { actionDeckConfig } from "../../utils"

export type ActionCard = string
export const ActionCardRegistry: Record<ActionCard, IActionCard> = {}

export class ActionDeck extends Deck<ActionCard> {
  constructor() {
    super(Object.keys(ActionCardRegistry), actionDeckConfig)
  }
}
