import { ActionCardInput, ActionCardResult } from "./ActionCards"

export type ClientEvent =
  | { type: "join-game"; data: { gameName: string; password: string } }
  | { type: "create-game"; data: { gameName: string; password: string } }
  | { type: "play-card"; data: ActionCardInput }

export type GameEvent =
  | { type: "game-joined"; data: {} }
  | { type: "game-left"; data: {} }
  | { type: "card-played"; data: ActionCardResult }

export type ExtractEventData<
  T extends ClientEvent | GameEvent,
  U extends T["type"]
> = Extract<T, { type: U }>["data"]
