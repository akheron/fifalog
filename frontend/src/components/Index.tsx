import { Property } from 'baconjs'
import { Atom, Fragment, h, onUnmount } from 'harmaja'
import * as C from '../../../common/types'
import * as api from '../api'
import { editAtom } from '../atom-utils'
import * as Effect from '../effect'
import * as ForkedEffect from '../forked-effect'
import * as L from '../lenses'
import { trackStatus } from '../status'
import CreateRandomMatchPair from './CreateRandomMatchPair'
import MatchList, { MatchState, initialMatchState } from './MatchList'
import Stats from './Stats'

export type Data = {
  users: C.User[]
  stats: C.Stats[]
  matches: C.Match[]
}

export default () => {
  const initialData = api.initialData()
  initialData.run()

  return Effect.match(
    initialData,
    () => <div>Loading...</div>,
    data => <Content data={data} />,
    () => <div>Error fetching data</div>
  )
}

type State = {
  users: C.User[]
  stats: C.Stats[]
  matches: MatchState[]
}

const Content = (props: { data: Property<Data> }) => {
  const state: Atom<State> = editAtom(
    props.data.map(data => ({
      ...data,
      matches: data.matches.map(match => ({ ...match, status: 'idle' })),
    }))
  )

  const users = state.view('users')
  const stats = state.view('stats')
  const matches = state.view('matches')

  const createMatchPair = api.createRandomMatchPair()
  Effect.syncSuccess(
    createMatchPair,
    (currentMatches, newPair) => [
      ...newPair.map(initialMatchState),
      ...currentMatches,
    ],
    matches
  )

  const statusOf = (matchId: number) =>
    matches
      .view(L.find((match: MatchState) => match.id === matchId))
      .view('status')

  const finishMatch = async (matchId: number, result: C.MatchResultBody) => {
    const [newMatches, newStats] = await trackStatus(async () => {
      await api.finishMatch(matchId, result)
      return Promise.all([api.latestMatches_(), api.stats_()])
    }, statusOf(matchId))
    matches.set(newMatches.map(initialMatchState))
    stats.set(newStats)
  }

  const deleteMatch = ForkedEffect.fork(api.deleteMatch)
  ForkedEffect.syncSuccess(
    deleteMatch,
    (currentMatches, matchId) =>
      currentMatches.filter(match => match.id !== matchId),
    matches
  )

  return (
    <>
      <h2>Stats</h2>
      <Stats stats={stats} />
      <h2>Latest matches</h2>
      <CreateRandomMatchPair users={users} create={createMatchPair} />
      <MatchList
        matches={matches}
        deleteMatch={deleteMatch}
        onFinishMatch={finishMatch}
      />
    </>
  )
}
