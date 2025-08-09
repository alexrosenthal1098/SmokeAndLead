export type TrickInput =
  | { type: "peek"; data: { chamber: number } }
  | { type: "swap"; data: { chamber1: number; chamber2: number } }

export type TrickResult =
  | { type: "peek"; data: { bullet: string } }
  | { type: "swap"; data: {} }

export type ExtractTrickInput<T extends TrickInput['type']> = Extract<TrickInput, { type: T}>['data']
export type ExtractTrickResult<T extends TrickInput['type']> = Extract<TrickResult, { type: T}>['data']