import * as React from 'react'
import classNames from 'classnames'
import { Atom, F, bind } from '@grammarly/focal'
import { State } from '../state'
import { requireAtom } from '../utils'
import * as styles from './LoginForm.scss'

const LoginForm = (props: {
  state: Atom<State.LoggedOutState | undefined>
  onLogin: (username: string, password: string) => Promise<void>
}) => (
  <F.Fragment>
    {requireAtom(props.state, 'Loading...', state => (
      <F.form
        className={state.view(({ uiState }) =>
          classNames(styles.form, { [styles.invalid]: uiState === 'invalid' })
        )}
        onSubmit={e => {
          e.preventDefault()
          const { username, password } = state.get()
          props.onLogin(username, password)
        }}
      >
        <h2>Login</h2>
        <div>
          <label>
            <span>Username:</span>{' '}
            <F.input type="text" {...bind({ value: state.lens('username') })} />
          </label>
        </div>
        <div>
          <label>
            <span>Password:</span>{' '}
            <F.input
              type="password"
              {...bind({ value: state.lens('password') })}
            />
          </label>
        </div>
        <F.div>
          <F.button
            disabled={state.view(({ uiState }) => uiState === 'loading')}
          >
            Login
          </F.button>{' '}
          {state.view(({ uiState }) =>
            uiState === 'loading' ? <span>Loading...</span> : null
          )}
        </F.div>
      </F.form>
    ))}
  </F.Fragment>
)

export default LoginForm
