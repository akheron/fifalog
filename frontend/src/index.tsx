import { Atom, atom, h, mount } from 'harmaja'
import { initialData } from './api'
import { State, loggedIn, loggedInLoading, loggedOut } from './state'
import App from './components/App'

// Server-side rendered
declare const IS_LOGGED_IN: boolean

let state: Atom<State>
if (IS_LOGGED_IN) {
  state = atom(loggedInLoading())
  initialData().then(({ users, matches, stats }) =>
    state.set(loggedIn(users, matches, stats))
  )
} else {
  state = atom(loggedOut())
}

mount(<App state={state} />, document.getElementById('app')!)
