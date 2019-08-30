import { League, Team } from '../../common/types'

const swap = <A, B>([a, b]: [A, B]): [B, A] => [b, a]

const randomlySwap = <A>(arr: [A, A]): [A, A] =>
  Math.random() < 0.5 ? swap(arr) : arr

const factorial = (n: number): number => {
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

const nCk = (n: number, k: number): number => {
  return factorial(n) / (factorial(k) * factorial(n - k))
}

const sum = (arr: number[]): number => arr.reduce((acc, n) => acc + n, 0)

const numTeamPairs = (leagues: League[]) =>
  sum(leagues.map(({ teams }) => nCk(teams.length, 2)))

const nthTeamPairAndLeague = (
  leagues: League[],
  pairIndex: number
): [League, [Team, Team]] => {
  let currentIndex = -1
  for (const league of leagues) {
    const teams = league.teams
    for (let t1 = 0; t1 < teams.length - 1; t1++) {
      for (let t2 = t1 + 1; t2 < teams.length; t2++) {
        currentIndex++
        if (currentIndex === pairIndex) {
          return [league, [teams[t1], teams[t2]]]
        }
      }
    }
  }
  throw new Error('No teams defined')
}

export type RandomMatch = {
  leagueId: number
  homeId: number
  awayId: number
}

export const getRandomMatch = (leagues: League[]): RandomMatch => {
  const targetIndex = Math.floor(Math.random() * numTeamPairs(leagues))
  const [league, pair] = nthTeamPairAndLeague(leagues, targetIndex)
  const [home, away] = randomlySwap(pair)
  return { leagueId: league.id, homeId: home.id, awayId: away.id }
}
