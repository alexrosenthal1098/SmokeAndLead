export type ActionCardInput = 
  | { type: 'peek', data: { chamber: number } }
  | { type: 'swap', data: { chamber1: number, chamber2: number } }

export type ActionCardResult = 
  | { type: 'peek', data: { round: string } }
  | { type: 'swap', data: { }}

export type ExtractCardData<
  T extends ActionCardInput | ActionCardResult,
  U extends T["type"]
> = Extract<T, { type: U }>["data"]
