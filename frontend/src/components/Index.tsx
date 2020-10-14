import { Property } from 'baconjs'
import { Atom, Fragment, atom, h } from 'harmaja'
import * as C from '../../../common/types'
import * as api from '../api'
import { editAtom } from '../atom-utils'
import * as L from '../lenses'
import * as RD from '../remotedata'
import { Status, trackStatus } from '../status'
import CreateRandomMatchPair from './CreateRandomMatchPair'
import MatchList, { MatchState, initialMatchState } from './MatchList'
import Stats from './Stats'

export type Data = {
  users: C.User[]
  stats: C.Stats[]
  matches: C.Match[]
}

export default () => {
  // TODO: Could be just a property, but RD.match doesn't support it
  const state = editAtom(RD.fromPromise(api.initialData()))

  return RD.match(
    state,
    () => <div>Loading...</div>,
    data => <Content data={data} />,
    () => <div>Error fetching data</div>
  )
}

type State = {
  users: C.User[]
  stats: C.Stats[]
  matches: MatchState[]
  createStatus: Status
}

const Content = (props: { data: Property<Data> }) => {
  const state: Atom<State> = editAtom(
    props.data.map(data => ({
      ...data,
      matches: data.matches.map(match => ({ ...match, status: 'idle' })),
      createStatus: 'idle',
    }))
  )

  const users = state.view('users')
  const stats = state.view('stats')
  const matches = state.view('matches')
  const createStatus = state.view('createStatus')

  const createMatchPair = async (userIds: [number, number]) => {
    const newPair = await trackStatus(
      api.addRandomMatchPair(userIds),
      createStatus
    )
    matches.modify(prev => [...newPair.map(initialMatchState), ...prev])
  }

  const statusOf = (matchId: number) =>
    matches
      .view(L.find((match: MatchState) => match.id === matchId))
      .view('status')

  const finishMatch = async (matchId: number, result: C.MatchResultBody) => {
    const [newMatches, newStats] = await trackStatus(async () => {
      await api.finishMatch(matchId, result)
      return Promise.all([api.latestMatches(), api.stats()])
    }, statusOf(matchId))
    matches.set(newMatches.map(initialMatchState))
    stats.set(newStats)
  }

  const deleteMatch = async (matchId: number) => {
    if (!confirm('Really')) return
    const ok = await trackStatus(api.deleteMatch(matchId), statusOf(matchId))
    if (ok) {
      matches.modify(matches => matches.filter(match => match.id !== matchId))
    }
  }

  return (
    <>
      <h2>Stats</h2>
      <Stats stats={stats} />
      <h2>Latest matches</h2>
      <CreateRandomMatchPair
        users={users}
        status={createStatus}
        onCreate={createMatchPair}
      />
      <MatchList
        matches={matches}
        onDeleteMatch={deleteMatch}
        onFinishMatch={finishMatch}
      />
    </>
  )
}
