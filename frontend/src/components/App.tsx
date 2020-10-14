import { Atom, Fragment, atom, h } from 'harmaja'
import * as api from '../api'
import { match } from '../atom-utils'
import LoginForm, { Status as LoginFormStatus } from './LoginForm'
import Logout from './Logout'
import Index from './Index'
import './App.scss'

export type State = LoggedOut | LoggedIn

export type LoggedOut = {
  loggedIn: false
  status: LoginFormStatus
}

export type LoggedIn = {
  loggedIn: true
}

export type Props = { isLoggedIn: boolean }

export default ({ isLoggedIn }: Props) => {
  const state = atom(
    isLoggedIn ? { loggedIn: true } : { loggedIn: false, status: 'idle' }
  )

  const login = async (username: string, password: string) => {
    state.set({ loggedIn: false, status: 'loading' })
    if (await api.login(username, password)) {
      state.set({ loggedIn: true })
    } else {
      state.set({ loggedIn: false, status: 'invalid' })
    }
  }

  const logout = async () => {
    await api.logout()
    state.set({ loggedIn: false, status: 'idle' })
  }

  return (
    <main>
      {match(
        state,

        // LoggedOut
        (s): s is LoggedOut => !s.loggedIn,
        s => (
          <LoginForm status={s.view('status')} onLogin={login} />
        ),

        // LoggedIn
        s => (
          <>
            <Logout onLogout={logout} />
            <Index />
          </>
        )
      )}
    </main>
  )
}
