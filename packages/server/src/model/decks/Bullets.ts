import { Deck } from "./Deck"
import { GameModel } from "../GameModel"
import { bulletConfig } from "../../utils"

export type BulletName = string
export class BulletDeck extends Deck<Bullet> {
  constructor() {
    super(BulletRegistry, bulletConfig)
  }
}

export interface Bullet {
  name: BulletName

  play(game: GameModel): { hey: string } // TODO: Incorporate BulletResults?
}

export const BulletRegistry: Map<BulletName, Bullet> = new Map()
