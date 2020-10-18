import { Property } from 'baconjs'
import { Atom, Fragment, h } from 'harmaja'
import * as C from '../../../common/types'
import * as api from '../api'
import { editAtom } from '../atom-utils'
import * as Effect from '../effect'
import * as ForkedEffect from '../forked-effect'
import * as L from '../lenses'
import CreateRandomMatchPair from './CreateRandomMatchPair'
import MatchList from './MatchList'
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
  matches: C.Match[]
}

const Content = (props: { data: Property<Data> }) => {
  const state: Atom<State> = editAtom(props.data)

  const users = state.view('users')
  const stats = state.view('stats')
  const matches = state.view('matches')

  const createMatchPair = api.createRandomMatchPair()
  Effect.syncSuccess(
    createMatchPair,
    (currentMatches, newPair) => [...newPair, ...currentMatches],
    matches
  )

  const finishMatchAndRefresh = ForkedEffect.fork(
    api.finishMatchAndRefresh,
    (id: number) => (result: C.MatchResultBody) => ({ id, result })
  )
  ForkedEffect.syncSuccess(
    finishMatchAndRefresh,
    state.view(
      L.pick<State, 'matches' | 'stats'>(['matches', 'stats'])
    )
  )

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
        finishMatch={finishMatchAndRefresh}
      />
    </>
  )
}
