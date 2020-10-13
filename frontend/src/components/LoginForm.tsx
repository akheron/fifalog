import classNames from 'classnames'
import { Atom, h } from 'harmaja'
import { LoggedOutState } from '../state'
import Input from './Input'
import * as styles from './LoginForm.scss'

const LoginForm = (props: {
  state: Atom<LoggedOutState>
  onLogin: (username: string, password: string) => Promise<void>
}) => (
  <form
    className={props.state.map(({ uiState }) =>
      classNames(styles.form, { [styles.invalid]: uiState === 'invalid' })
    )}
    onSubmit={e => {
      e.preventDefault()
      const { username, password } = props.state.get()
      props.onLogin(username, password)
    }}
  >
    <h2>Login</h2>
    <div>
      <label>
        <span>Username:</span>{' '}
        <Input type="text" value={props.state.view('username')} />
      </label>
    </div>
    <div>
      <label>
        <span>Password:</span>{' '}
        <Input type="password" value={props.state.view('password')} />
      </label>
    </div>
    <div>
      <button
        disabled={props.state.map(({ uiState }) => uiState === 'loading')}
      >
        Login
      </button>{' '}
      {props.state.map(({ uiState }) =>
        uiState === 'loading' ? <span>Loading...</span> : null
      )}
    </div>
  </form>
)

export default LoginForm
