import { Constructor, Deck } from "../Deck"
import { trickConfig } from "../../../utils"
import { TrickInput } from "@smoke-and-lead/shared"
import { Peek } from "./Peek"
import { Trick } from "./Trick"

export type TrickName = TrickInput["type"]
export class TrickDeck extends Deck<Trick> {
  constructor() {
    super(TrickRegistry, trickConfig)
  }
}

export const TrickRegistry: Map<TrickName, Constructor<Trick>> = new Map([
  ["peek", Peek],
])
