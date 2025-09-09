import { ServerEvent, TrickInput, ExtractTrickInput } from "@smoke-and-lead/shared"
import { GameModel } from "../../GameModel"
import { PlayerId } from "../../Player"
import { TrickName } from "./TrickDeck"

export type TrickPlayed = {
  personalEvents: ServerEvent[],
  publicEvents: ServerEvent[],
  final: boolean,
  otherPlayerEvents?: Map<PlayerId, ServerEvent>,
}

export abstract class Trick {
  abstract readonly name: TrickName
  abstract inPlay: boolean

  play(game: GameModel, cardInput: TrickInput): TrickPlayed {
    if (cardInput.type !== this.name) {
      throw new Error("Invalid card input given")
    }

    return this._play(game, cardInput.data)
  }

  protected abstract _play(
    game: GameModel,
    cardInput: ExtractTrickInput<typeof this.name>
  ): TrickPlayed
}