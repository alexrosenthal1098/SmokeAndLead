import { ExtractTrickInput } from "@smoke-and-lead/shared"
import { GameModel } from "../../GameModel"
import { Trick, TrickPlayed } from "./TrickDeck"

export class Peek extends Trick {
  readonly name = "peek"
  inPlay = false;

  _play(
    game: GameModel,
    cardInput: ExtractTrickInput<typeof this.name>
  ): TrickPlayed {
    const bullet = game.chambers.get(cardInput.chamber)
    if (bullet === undefined) {
      throw new Error("Invalid chamber given")
    }
    return {
      personalEvents: [{
        type: "peek", data: { bullet: bullet.name }
      }],
      publicEvents: [],
      final: true,
    }
  }
}
