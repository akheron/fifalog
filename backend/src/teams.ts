import * as Option from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
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
): Option.Option<[League, [Team, Team]]> => {
  let currentIndex = -1
  for (const league of leagues) {
    const teams = league.teams
    for (let t1 = 0; t1 < teams.length - 1; t1++) {
      for (let t2 = t1 + 1; t2 < teams.length; t2++) {
        currentIndex++
        if (currentIndex === pairIndex) {
          return Option.some([league, [teams[t1], teams[t2]]])
        }
      }
    }
  }
  return Option.none
}

export type RandomMatch = {
  leagueId: number | null
  homeId: number
  awayId: number
}

export const getRandomMatchFromLeagues = (
  leagues: League[]
): Option.Option<RandomMatch> => {
  const targetIndex = Math.floor(Math.random() * numTeamPairs(leagues))
  return pipe(
    nthTeamPairAndLeague(leagues, targetIndex),
    Option.map(([league, pair]) => {
      const [home, away] = randomlySwap(pair)
      return {
        leagueId: league.id,
        homeId: home.id,
        awayId: away.id,
      }
    })
  )
}

export const getRandomMatchFromAll = (
  leagues: League[]
): Option.Option<RandomMatch> => {
  const teams = leagues.map(league => league.teams).flat()
  if (teams.length < 2) {
    return Option.none
  }
  while (true) {
    const team1 = teams[randInt(teams.length)]
    const team2 = teams[randInt(teams.length)]
    if (team1.id !== team2.id) {
      return Option.some({
        leagueId: null,
        homeId: team1.id,
        awayId: team2.id,
      })
    }
  }
}

/**
 * Random integer in [0, max)
 */
const randInt = (max: number) => Math.floor(Math.random() * max)
