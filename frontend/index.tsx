import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Atom } from '@grammarly/focal'

import * as api from './api'
import { State, initialState } from './state'
import App from './components/App'

const state: Atom<State> = Atom.create(undefined)

Promise.all([api.users(), api.latestMatches(), api.stats()]).then(
  ([users, matches, stats]) => state.set(initialState(users, matches, stats))
)

ReactDOM.render(<App state={state} />, document.getElementById('app'))
