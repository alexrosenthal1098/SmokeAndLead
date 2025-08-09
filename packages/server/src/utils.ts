export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array] // optional: avoid mutating original
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const rawActionJson = await import(
  `./config/acion-deck.${process.env.ACTION_DECK ?? "standard"}.json`
)
export const actionDeckConfig: Record<string, number> = JSON.parse(rawActionJson)

const rawRoundJson = await import(
  `./config/round-deck.${process.env.ROUND_DECK ?? "standard"}.json`
)
export const roundDeckConfig: Record<string, number> = JSON.parse(rawRoundJson)