export type TrickInput =
  | { type: "trigger"; data: { } }
  | { type: "peek"; data: { chamber: number } }
  | { type: "swap"; data: { chamber1: number; chamber2: number, swap?: boolean } }

export type TrickResult =
  | { type: "card-error"; data: { reason: string } }
  | { type: "bullet-fired"; data: { chamber: number, bullet: string } }
  | { type: "player-killed"; data: { player: string } }
  | { type: "peek"; data: { bullet: string } }
  | { type: "swap-choices"; data: { chamber1Bullet: string; chamber2Bullet: string } }

export type ExtractTrickInput<T extends TrickInput['type']> = Extract<TrickInput, { type: T}>['data']
export type ExtractTrickResult<T extends TrickInput['type']> = Extract<TrickResult, { type: T}>['data']