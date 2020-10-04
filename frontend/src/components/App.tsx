import * as React from 'react'
import { Atom, Option, Prism, F } from '@grammarly/focal'

import { login } from '../mutations'
import { State } from '../state'
import LoginForm from './LoginForm'
import Logout from './Logout'
import Index from './Index'
import './App.scss'

const loggedIn = Prism.create(
  (state: State): Option<State.LoggedInState> =>
    state.kind === 'LoggedIn' ? state.state : undefined,
  (v: State.LoggedInState, _: State): State => ({ kind: 'LoggedIn', state: v })
)

const loggedOut = Prism.create(
  (state: State): Option<State.LoggedOutState> =>
    state.kind === 'LoggedOut' ? state.state : undefined,
  (v: State.LoggedOutState, _: State): State => ({
    kind: 'LoggedOut',
    state: v,
  })
)

export default (props: { state: Atom<State> }) => {
  return (
    <F.main>
      {props.state.view(state => {
        switch (state.kind) {
          case 'LoggedOut':
            return (
              <LoginForm
                state={props.state.lens(loggedOut)}
                onLogin={(username, password) =>
                  login(props.state, username, password)
                }
              />
            )

          case 'LoggedIn':
            return (
              <>
                <Logout state={props.state} />
                <Index state={props.state.lens(loggedIn)} />
              </>
            )
        }
      })}
    </F.main>
  )
}
