import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Atom } from '@grammarly/focal'

import { fetchUsers, fetchLatestMatches } from './mutations'
import { initialState } from './state'
import App from './components/App'

const state = Atom.create(initialState)

fetchUsers(state.lens('users'), state.lens('createRandomMatchPair'))
fetchLatestMatches(state.lens('latestMatches'))

ReactDOM.render(<App state={state} />, document.getElementById('app'))
