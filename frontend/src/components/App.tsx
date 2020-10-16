import { Fragment, atom, h } from 'harmaja'
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

  const login = Effect.fromPromise(api.login)
  Effect.onSuccess(login, ok => {
    state.set(ok)
  })

  const logout = Effect.fromPromise(api.logout)
  Effect.onSuccess(logout, () => {
    state.set(false)
  })

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
