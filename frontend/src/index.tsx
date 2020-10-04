import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Atom } from '@grammarly/focal'

import { initialData } from './api'
import { State, loggedIn, loggedInLoading, loggedOut } from './state'
import App from './components/App'

// Server-side rendered
declare const IS_LOGGED_IN: boolean

let state: Atom<State>
if (IS_LOGGED_IN) {
  state = Atom.create(loggedInLoading())
  initialData().then(({ users, matches, stats }) =>
    state.set(loggedIn(users, matches, stats))
  )
} else {
  state = Atom.create(loggedOut())
}

ReactDOM.render(<App state={state} />, document.getElementById('app'))
