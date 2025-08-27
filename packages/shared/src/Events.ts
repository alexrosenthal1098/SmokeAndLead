import { TrickInput, TrickResult } from "./Cards"

export type ClientEvent =
  | { type: "create-lobby"; data: { gameId: string; password: string } }
  | { type: "join-game"; data: { gameId: string; password: string } }
  | { type: "request-game-info"; data: { gameId: string } }
  | { type: "stop-spectating"; data: { gameId: string } }
  | { type: "leave-lobby"; data: { gameId: string } }
  | { type: "start-game"; data: { gameId: string } }
  | { type: "leave-game"; data: { gameId: string } }
  | { type: "play-card"; data: { gameId: string, cardInput: TrickInput } }
  | { type: "end-turn"; data: { gameId: string } }

export type PublicPlayerInfo = {
  playerId: string
  cardSize: number
  orderNumber: number
}
export type PersonalInfo = { hand: string[] }
export type GameInfo = {
  latestRoll: number
  currentTurn: string
  shooter: string
  personalInfo: PersonalInfo | undefined
  trickDeckSize: number
  bulletDeckSize: number
  playersInfo: PublicPlayerInfo[]
  chambersInfo: Map<number, string> // Chamber number (1-6) to name of the round, can be "hidden" or something
}
export type LobbyInfo = {
  host: string
  allPlayers: [string, string][] // PlayerId, Character
  numSpectators: number
}
export type ServerEvent =
  | { type: "error"; data: { reason: string } }
  | { type: "lobby-created"; data: {} }
  | { type: "lobby-joined"; data: LobbyInfo }
  | { type: "player-joined"; data: { player: string; character: string } }
  | { type: "lobby-spectating"; data: LobbyInfo }
  | { type: "game-spectating"; data: GameInfo }
  | { type: "spectator-joined"; data: { player: string } }
  | { type: "stopped-spectating"; data: {} }
  | { type: "sectator-left"; data: { player: string } }
  | { type: "left-lobby"; data: {} }
  | { type: "player-left"; data: { player: string } }
  | { type: "game-started"; data: GameInfo } // personalInfo should be undefined
  | { type: "game-info"; data: GameInfo }
  | { type: "personal-info"; data: PersonalInfo }
  | { type: "left-game"; data: {} }
  | { type: "player-left", data: {} }
  | { type: "card-played", data: { player: string, cardName: TrickInput["type"] } }

export type ExtractEventData<T extends ClientEvent | ServerEvent, U extends T["type"]> = Extract<T, { type: U }>["data"]
