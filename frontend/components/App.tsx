import * as React from 'react'
import { Atom } from '@grammarly/focal'
import RandomizeButton from './RandomizeButton'
import SelectedTeams from './SelectedTeams'
import { Team } from '../types'
import { modifyAtom } from '../utils'
import { BUCKETS } from '../constants'
import { getRandomTeams } from '../teams'
import './App.scss'

type State = [Team, Team] | null

const state: Atom<State> = Atom.create(null)

export default () => (
  <div>
    <RandomizeButton
      onClick={modifyAtom(state, () => getRandomTeams(BUCKETS))}
    />
    <SelectedTeams teams={state} />
  </div>
)
