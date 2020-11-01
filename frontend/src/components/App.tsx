import { Fragment, atom, h } from 'harmaja/bacon'
import * as Effect from '../effect'
import * as api from '../api'
import { ifElse } from '../atom-utils'
import LoginForm from './LoginForm'
import Logout from './Logout'
import Index from './Index'
import './App.scss'

export type Props = { isLoggedIn: boolean }

export default ({ isLoggedIn }: Props) => {
  const state = atom(isLoggedIn)

  const login = api.login()
  Effect.syncSuccess(login, state)

  const logout = api.logout()
  Effect.syncSuccess(logout, () => false, state)

  return (
    <main>
      {ifElse(
        state,
        () => (
          <>
            <Logout logout={logout} />
            <Index />
          </>
        ),
        () => (
          <LoginForm login={login} />
        )
      )}
    </main>
  )
}
