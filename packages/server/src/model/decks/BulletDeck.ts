import { Constructor, Deck } from "./Deck"
import { GameModel } from "../GameModel"
import { bulletConfig } from "../../utils"
import { PlayerId } from "../Player"

export type BulletName = string
export class BulletDeck extends Deck<Bullet> {
  constructor() {
    super(BulletRegistry, bulletConfig)
  }
}

export abstract class  Bullet {
  abstract name: BulletName
  abstract hidden: boolean

  getDescription(): string {
    return this.hidden ? "hidden" : this.name
  }
}

class DeadlyBullet extends Bullet {
  name = "bullet"
  hidden = true
}

class Blank extends Bullet {
  name = "blank"
  hidden = true
}

export const BulletRegistry: Map<BulletName, Constructor<Bullet>> = new Map([
  ["bullet", DeadlyBullet],
  ["blank", Blank],
])
