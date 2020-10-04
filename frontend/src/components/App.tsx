import { Atom, h } from 'harmaja'

import { login } from '../mutations'
import { State } from '../state'
import { match } from '../atom-utils'
import LoginForm from './LoginForm'
import Logout from './Logout'
import Index from './Index'
import './App.scss'

export default (props: { state: Atom<State> }) => {
  return (
    <main>
      {match(
        props.state,

        // LoggedOut
        (s): s is State.LoggedOut => s.kind === 'LoggedOut',
        s => (
          <LoginForm
            state={s.view('state')}
            onLogin={(username, password) =>
              login(props.state, username, password)
            }
          />
        ),

        // LoggedIn
        s => (
          <div>
            <Logout state={props.state} />
            <Index state={s.view('state')} />
          </div>
        )
      )}
    </main>
  )
}
