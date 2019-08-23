import * as React from 'react'
import { Atom } from '@grammarly/focal'
import RandomizeButton from './RandomizeButton'
import RandomMatch from './RandomMatch'
import { Match } from '../../common/types'
import { modifyAtom } from '../utils'
import { LEAGUES } from '../constants'
import { getRandomMatch } from '../teams'
import './App.scss'

type State = {
  randomMatch: Match | null
}

const state: Atom<State> = Atom.create({ randomMatch: null })

const randomMatch = state.lens('randomMatch')

export default () => (
  <div>
    <RandomizeButton
      onClick={modifyAtom(randomMatch, () => getRandomMatch(LEAGUES))}
    />
    <RandomMatch match={randomMatch} />
  </div>
)
