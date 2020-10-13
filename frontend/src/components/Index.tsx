import { Atom, Fragment, h } from 'harmaja'
import * as C from '../../../common/types'
import { definedOr } from '../atom-utils'
import { MatchRow } from '../state'

import CreateRandomMatchPair from './CreateRandomMatchPair'
import MatchList from './MatchList'
import Stats from './Stats'

export type State = {
  users: C.User[]
  stats: C.Stats[]
  matches: MatchRow[]
}

export type Props = { state: Atom<State | undefined> }

export default ({ state }: Props) =>
  definedOr(
    state,
    s => (
      <>
        <h2>Stats</h2>
        <Stats stats={s.view('stats')} />
        <h2>Latest matches</h2>
        <CreateRandomMatchPair
          users={s.view('users')}
          matches={s.view('matches')}
        />
        <MatchList rows={s.view('matches')} stats={s.view('stats')} />
      </>
    ),

    () => <span>Loading...</span>
  )
