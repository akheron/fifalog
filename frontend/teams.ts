import { Bucket, Team } from './types'

const swap = <A, B>([a, b]: [A, B]): [B, A] => [b, a]

const factorial = (n: number): number => {
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

const nCk = (n: number, k: number): number => {
  return factorial(n) / (factorial(k) * factorial(n - k))
}

const sum = (arr: number[]): number => arr.reduce((acc, n) => acc + n, 0)

const numTeamPairs = (buckets: Bucket[]) =>
  sum(buckets.map(({ teams }) => nCk(teams.length, 2)))

const nthTeamPair = (buckets: Bucket[], pairIndex: number): [Team, Team] => {
  let currentIndex = -1
  for (const { teams } of buckets) {
    for (let t1 = 0; t1 < teams.length - 1; t1++) {
      for (let t2 = t1 + 1; t2 < teams.length; t2++) {
        currentIndex++
        if (currentIndex === pairIndex) {
          return [teams[t1], teams[t2]]
        }
      }
    }
  }
  throw new Error('No teams defined')
}

export const getRandomTeams = (buckets: Bucket[]): [Team, Team] => {
  const targetIndex = Math.floor(Math.random() * numTeamPairs(buckets))
  const pair = nthTeamPair(buckets, targetIndex)
  if (Math.random() < 0.5) return swap(pair)
  return pair
}
