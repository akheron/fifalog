import { Atom, Fragment, h } from 'harmaja'
import * as C from '../../../common/types'
import * as api from '../api'
import CreateRandomMatchPair from './CreateRandomMatchPair'
import MatchList from './MatchList'
import Stats from './Stats'

export type State = {
  users: C.User[]
  stats: C.Stats[]
  matches: C.Match[]
}

export type Props = { state: Atom<State> }

export default ({ state }: Props) => {
  const users = state.view('users')
  const stats = state.view('stats')
  const matches = state.view('matches')

  const deleteMatch = async (id: number) => {
    if (!confirm('Really')) return
    if (await api.deleteMatch(id)) {
      matches.modify(matches => matches.filter(match => match.id !== id))
    }
  }

  const createMatchPair = async (userIds: [number, number]) => {
    const newPair = await api.addRandomMatchPair(userIds)
    matches.modify(prev => [...newPair, ...prev])
  }

  const finishMatch = async (matchId: number, result: C.MatchResultBody) => {
    await api.finishMatch(matchId, result)
    const newMatches = await api.latestMatches()
    const newStats = await api.stats()
    matches.set(newMatches)
    stats.set(newStats)
  }

  return (
    <>
      <h2>Stats</h2>
      <Stats stats={stats} />
      <h2>Latest matches</h2>
      <CreateRandomMatchPair users={users} onCreate={createMatchPair} />
      <MatchList
        matches={matches}
        onDeleteMatch={deleteMatch}
        onFinishMatch={finishMatch}
      />
    </>
  )
}
