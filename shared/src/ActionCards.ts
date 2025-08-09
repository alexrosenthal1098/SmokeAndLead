type ActionCardInput = 
  | { type: 'peek', chamber: number }

type ActionCardResult = 
  | { type: 'peek', round: string }