import * as React from 'react'
import { Atom } from '@grammarly/focal'
import RandomizeButton from './RandomizeButton'
import SelectedTeams from './SelectedTeams'
import { Bucket, Team } from '../types'
import { modifyAtom } from '../utils'

const buckets: Bucket[] = [
  {
    name: 'International',
    teams: [
      'Argentina',
      'Belgium',
      'Brazil',
      'England',
      'France',
      'Germany',
      'Italy',
      'Netherlands',
      'Portugal',
      'Spain',
      'Uruguay',
    ],
  },
  {
    name: 'England',
    teams: [
      'Arsenal',
      'Chelsea',
      'Liverpool',
      'Manchester City',
      'Manchester United',
      'Spurs',
    ],
  },
  { name: 'Germany', teams: ['Dortmund', 'FC Bayern'] },
  { name: 'Spain', teams: ['Atletico Madrid', 'FC Barcelona', 'Real Madrid'] },
]

type State = [Team, Team] | null

const state: Atom<State> = Atom.create(null)

const getRandomBucket = (): Bucket => {
  return buckets[Math.floor(Math.random() * buckets.length)]
}

const getRandomTeam = (teams: Team[]): Team => {
  return teams[Math.floor(Math.random() * teams.length)]
}

const getRandomTeams = (): [Team, Team] => {
  const bucket = getRandomBucket()
  const team1 = getRandomTeam(bucket.teams)
  let team2
  do {
    team2 = getRandomTeam(bucket.teams)
  } while (team2 === team1)

  return [team1, team2]
}

export default () => (
  <div>
    <RandomizeButton onClick={modifyAtom(state, getRandomTeams)} />
    <SelectedTeams teams={state} />
  </div>
)
