import { ExtractTrickInput } from "@smoke-and-lead/shared"
import { GameModel } from "../../GameModel"
import { Trick, TrickPlayed } from "./Trick"

export class Swap extends Trick {
  readonly name = "swap"
  inPlay = false

  private chamber1?: number
  private chamber2?: number

  _play(game: GameModel, cardInput: ExtractTrickInput<typeof this.name>): TrickPlayed {
    if (this.areInputErrors(cardInput)) {
      return {
        personalEvents: [
          {
            type: "card-error",
            data: { reason: "Given chambers must be different and numbered 1-6." },
          },
        ],
        publicEvents: [],
        final: false,
      }
    }

    if (!this.inPlay) {
      // Save the original chambers they wanted to select
      this.chamber1 = cardInput.chamber1
      this.chamber2 = cardInput.chamber2
      this.inPlay = true
      return {
        personalEvents: [
          {
            type: "swap-choices",
            data: {
              chamber1Bullet: game.chambers.get(this.chamber1)!.name,
              chamber2Bullet: game.chambers.get(this.chamber2)!.name,
            },
          },
        ],
        publicEvents: [],
        final: false,
      }
    } else {
      if (cardInput.swap) {
        const bullet1 = game.chambers.get(this.chamber1!)
        const bullet2 = game.chambers.get(this.chamber2!)
        game.chambers.set(this.chamber1!, bullet1!)
        game.chambers.set(this.chamber2!, bullet2!)
      }

      return {
        personalEvents: [],
        publicEvents: [],
        final: true,
      }
    }
  }

  private areInputErrors(input: ExtractTrickInput<typeof this.name>): boolean {
    return (
        input.chamber1 > 6 || input.chamber1 < 1 ||
        input.chamber2 > 6 || input.chamber2 < 1 ||
        input.chamber1 === input.chamber2
    )
  }
}
