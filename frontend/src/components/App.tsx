import { Atom, Fragment, atom, h } from 'harmaja'

import * as api from '../api'
import { rowFromMatch } from '../state'
import { match } from '../atom-utils'
import LoginForm from './LoginForm'
import Logout from './Logout'
import Index, { State as IndexState } from './Index'
import './App.scss'
import { Match, Stats, User } from '../../../common/types'

export type State = LoggedOut | LoggedIn

export type LoggedOut = {
  kind: 'LoggedOut'
  status: 'idle' | 'invalid' | 'loading'
}

export type LoggedIn = {
  kind: 'LoggedIn'
  state: IndexState | undefined
}

export function loggedOut(
  status: 'idle' | 'invalid' | 'loading' = 'idle'
): State {
  return { kind: 'LoggedOut', status }
}

export function loggedInLoading(): State {
  return {
    kind: 'LoggedIn',
    state: undefined,
  }
}

export function loggedIn(
  users: User[],
  matches: Match[],
  stats: Stats[]
): State {
  return {
    kind: 'LoggedIn',
    state: {
      users,
      stats,
      matches: matches.map(rowFromMatch),
    },
  }
}

export type Props = { isLoggedIn: boolean }

const App = ({ isLoggedIn }: Props) => {
  let state: Atom<State>
  if (isLoggedIn) {
    state = atom(loggedInLoading())
    api
      .initialData()
      .then(({ users, matches, stats }) =>
        state.set(loggedIn(users, matches, stats))
      )
  } else {
    state = atom(loggedOut())
  }

  const login = async (username: string, password: string) => {
    state.set(loggedOut('loading'))
    if (await api.login(username, password)) {
      Promise.all([
        api.users(),
        api.latestMatches(),
        api.stats(),
      ]).then(([users, matches, stats]) =>
        state.set(loggedIn(users, matches, stats))
      )
    } else {
      state.set(loggedOut('invalid'))
    }
  }

  const logout = async () => {
    await api.logout()
    state.set(loggedOut())
  }

  return (
    <main>
      {match(
        state,

        // LoggedOut
        (s): s is LoggedOut => s.kind === 'LoggedOut',
        s => (
          <LoginForm status={s.view('status')} onLogin={login} />
        ),

        // LoggedIn
        s => (
          <>
            <Logout onLogout={logout} />
            <Index state={s.view('state')} />
          </>
        )
      )}
    </main>
  )
}

export default App
