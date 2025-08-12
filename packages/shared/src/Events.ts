import { TrickInput, TrickResult } from "./Cards"

export type ClientEvent =
  | { type: "request-game-info"; data: { gameId: string } }
  | { type: "create-lobby"; data: { gameId: string; password: string } }
  | { type: "join-game"; data: { gameName: string; password: string } }
  | { type: "play-card"; data: TrickInput }

export type PlayerInfo = {
  playerId: string
  cardSize: number
  orderNumber: number
  avatarName: string
}

export type GameInfo = {
  currentTurn: string
  shooter: string
  personalInfo: { hand: string[] } | undefined
  trickDeckSize: number
  bulletDeckSize: number
  playerInfos: PlayerInfo[]
}

export type ServerEvent =
  | { type: "lobby-created", data: { } }


  | { type: "game-ended"; data: { reason: string } }
  | { type: "game-info"; data: GameInfo }
  | { type: "game-joined"; data: {} }
  | { type: "game-left"; data: {} }
  | { type: "card-played"; data: TrickResult }

export type ExtractEventData<
  T extends ClientEvent | ServerEvent,
  U extends T["type"]
> = Extract<T, { type: U }>["data"]
