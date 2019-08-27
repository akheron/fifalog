import * as React from 'react'
import { Atom, F } from '@grammarly/focal'

import { State } from '../state'
import { createRandomMatchPair } from '../mutations'
import CreateRandomMatchPair from './CreateRandomMatchPair'
import MatchList from './MatchList'
import './App.scss'

type Props = { state: Atom<State> }

export default ({ state }: Props) => (
  <F.div>
    {state.view(({ latestMatches, users }) =>
      latestMatches == null || users == null ? (
        'Loading...'
      ) : (
        <>
          <h2>Latest matches</h2>
          <CreateRandomMatchPair
            users={users}
            latestMatches={state.lens('latestMatches')}
            state={state.lens('createRandomMatchPair')}
          />

          <MatchList matches={latestMatches} />
        </>
      )
    )}
  </F.div>
)
