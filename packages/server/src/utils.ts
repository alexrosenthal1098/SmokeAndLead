export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array] // optional: avoid mutating original
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const trickJson = await import(
  `./deck-configs/trick-deck.${process.env.TRICK_DECK ?? "standard"}.json`
)
export const trickConfig: Record<string, number> = trickJson.default

const bulletJson = await import(
  `./deck-configs/bullet-deck.${process.env.BULLET_DECK ?? "standard"}.json`
)
export const bulletConfig: Record<string, number> = bulletJson.default
