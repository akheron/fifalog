import * as React from 'react'
import { Atom, F } from '@grammarly/focal'

import { State } from '../state'
import { getRandomMatch } from '../teams'
import { modifyAtom } from '../utils'
import RandomizeButton from './RandomizeButton'
import RandomMatch from './RandomMatch'
import './App.scss'

type Props = { state: Atom<State> }

export default ({ state }: Props) => (
  <F.div>
    {state.view(({ leagues }) =>
      leagues == null ? (
        'Loading...'
      ) : (
        <>
          <RandomizeButton
            onClick={modifyAtom(state.lens('randomMatch'), () =>
              getRandomMatch(leagues)
            )}
          />
          <RandomMatch match={state.lens('randomMatch')} />
        </>
      )
    )}
  </F.div>
)
