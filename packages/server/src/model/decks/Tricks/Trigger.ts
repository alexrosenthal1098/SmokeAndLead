import { ExtractTrickInput } from "@smoke-and-lead/shared"
import { GameModel } from "../../GameModel"
import { Trick, TrickPlayed } from "./Trick"

export class Trigger extends Trick {
  readonly name = "trigger"
  inPlay = false

  _play(game: GameModel, cardInput: ExtractTrickInput<typeof this.name>): TrickPlayed {
    return game.trigger()
  }
}
