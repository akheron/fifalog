import { League } from '../common/types'

export const LEAGUES: League[] = [
  {
    id: 1,
    name: 'International',
    teams: [
      { id: 1, name: 'Argentina' },
      { id: 2, name: 'Belgium' },
      { id: 3, name: 'Brazil' },
      { id: 4, name: 'England' },
      { id: 5, name: 'France' },
      { id: 6, name: 'Germany' },
      { id: 7, name: 'Italy' },
      { id: 8, name: 'Netherlands' },
      { id: 9, name: 'Portugal' },
      { id: 10, name: 'Spain' },
      { id: 11, name: 'Uruguay' },
    ],
  },
  {
    id: 2,
    name: 'England',
    teams: [
      { id: 21, name: 'Arsenal' },
      { id: 22, name: 'Chelsea' },
      { id: 23, name: 'Liverpool' },
      { id: 24, name: 'Manchester City' },
      { id: 25, name: 'Manchester United' },
      { id: 26, name: 'Spurs' },
    ],
  },
  {
    id: 3,
    name: 'Germany',
    teams: [{ id: 31, name: 'Dortmund' }, { id: 32, name: 'FC Bayern' }],
  },
  {
    id: 4,
    name: 'Spain',
    teams: [
      { id: 41, name: 'Atletico Madrid' },
      { id: 42, name: 'FC Barcelona' },
      { id: 43, name: 'Real Madrid' },
    ],
  },
]
