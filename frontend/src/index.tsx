import { h, mount } from 'harmaja'
import App from './components/App'

// Server-side rendered
declare const IS_LOGGED_IN: boolean

mount(<App isLoggedIn={IS_LOGGED_IN} />, document.getElementById('app')!)
