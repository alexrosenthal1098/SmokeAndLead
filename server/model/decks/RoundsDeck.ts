import { Deck } from "./Deck"
import { IRoundCard } from "./cards/RoundCard"
import { roundsDeckConfig } from "../../utils"

const ActionCardRegistry: Record<string, IRoundCard> = {}

export class RoundsDeck extends Deck<IRoundCard> {
  constructor() {
    super(ActionCardRegistry, roundsDeckConfig)
  }
}
