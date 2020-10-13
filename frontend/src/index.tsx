import { Atom, atom, h, mount } from 'harmaja'
import { initialData } from './api'
import App, { State as AppState, loggedIn, loggedInLoading, loggedOut } from './components/App'

// Server-side rendered
declare const IS_LOGGED_IN: boolean

mount(<App isLoggedIn={IS_LOGGED_IN} />, document.getElementById('app')!)
