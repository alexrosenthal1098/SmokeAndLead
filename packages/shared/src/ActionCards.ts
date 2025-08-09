export type ActionCardInput = 
  | { type: 'peek', chamber: number }
  | { type: 'swap', chamber1: number, chamber2: number }

export type ActionCardResult = 
  | { round: string }
  | { }