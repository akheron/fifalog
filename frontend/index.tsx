import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Atom } from '@grammarly/focal'

import * as api from './api'
import { initialState } from './state'
import App from './components/App'

const state = Atom.create(initialState)

api.leagues().then(leagues => {
  state.lens('leagues').set(leagues)
})

ReactDOM.render(<App state={state} />, document.getElementById('app'))
