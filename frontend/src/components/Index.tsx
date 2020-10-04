import * as React from 'react'
import { Atom, F } from '@grammarly/focal'

import { State } from '../state'
import { requireAtom } from '../utils'
import CreateRandomMatchPair from './CreateRandomMatchPair'
import MatchList from './MatchList'
import Stats from './Stats'

export default (props: { state: Atom<State.LoggedInState> }) => (
  <F.Fragment>
    {requireAtom(props.state, 'Loading...', state => (
      <F.Fragment>
        {state.view(({ users, stats }) => (
          <>
            <h2>Stats</h2>
            <Stats stats={stats} />
            <h2>Latest matches</h2>
            <CreateRandomMatchPair
              users={users}
              matches={state.lens('matches')}
              state={state.lens('create')}
            />
            <MatchList
              rows={state.lens('matches')}
              stats={state.lens('stats')}
            />
          </>
        ))}
      </F.Fragment>
    ))}
  </F.Fragment>
)
