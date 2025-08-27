import { ExtractTrickInput, TrickResult } from "@smoke-and-lead/shared"
import { GameModel } from "../../GameModel"
import { Trick, TrickPlayed } from "./TrickDeck"

export class Trigger extends Trick {
  readonly name = "trigger"
  inPlay = false

  _play(
    game: GameModel,
    cardInput: ExtractTrickInput<typeof this.name>
  ): TrickPlayed {
    const chamber = Math.floor(Math.random() * 6) + 1;
    const bullet = game.chambers.get(chamber)!.name
    const publicEvents: TrickResult[] = [
        {
            type: "bullet-fired",
            data: { chamber, bullet }
        }
    ]
    switch(bullet) {
        case "bullet":
            const deadPlayer = game.killAtChamber(chamber)
            if (deadPlayer) {
                publicEvents.push(
                    {
                        type: "player-killed",
                        data: { player: deadPlayer } 
                    },
                )
            }
            game.chambers.set(chamber, game.bulletDeck.drawCard())
            break;
        case "blank": 
            break
        default:
            throw new Error("Unkown bullet name.")
    }

    return {
        personalEvents: [],
        publicEvents,
        final: true,
    }
  }
}