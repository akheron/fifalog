import * as React from 'react'
import { Atom, F } from '@grammarly/focal'

import { State } from '../state'
import { requireAtom } from '../utils'
import CreateRandomMatchPair from './CreateRandomMatchPair'
import MatchList from './MatchList'
import './App.scss'

export default (props: { state: Atom<State> }) => (
  <F.div>
    {requireAtom(props.state, 'Loading...', state => (
      <F.Fragment>
        {state.view(({ users }) => (
          <>
            <h2>Latest matches</h2>
            <CreateRandomMatchPair
              users={users}
              latestMatches={state.lens('matches')}
              state={state.lens('createRandomMatchPair')}
            />
            <MatchList matches={state.lens('matches')} />
          </>
        ))}
      </F.Fragment>
    ))}
  </F.div>
)
