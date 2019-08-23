import { League } from '../common/types'

export const leagues = async (): Promise<League[]> =>
  fetch('/api/leagues').then(l => l.json())
