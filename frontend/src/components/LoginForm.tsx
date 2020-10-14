import { Property } from 'baconjs'
import classNames from 'classnames'
import { atom, h } from 'harmaja'
import Input from './Input'
import * as styles from './LoginForm.scss'

export type Status = 'idle' | 'loading' | 'invalid' | 'error'

export type Props = {
  status: Property<Status>
  onLogin: (username: string, password: string) => void
}

export default ({ status, onLogin }: Props) => {
  const state = atom({ username: '', password: '' })
  return (
    <form
      className={status.map(s =>
        classNames(styles.form, { [styles.invalid]: s === 'invalid' })
      )}
      onSubmit={e => {
        e.preventDefault()
        const { username, password } = state.get()
        onLogin(username, password)
      }}
    >
      <h2>Login</h2>
      <div>
        <label>
          <span>Username:</span>{' '}
          <Input type="text" value={state.view('username')} />
        </label>
      </div>
      <div>
        <label>
          <span>Password:</span>{' '}
          <Input type="password" value={state.view('password')} />
        </label>
      </div>
      <div>
        <button disabled={status.map(s => s === 'loading')}>Login</button>{' '}
        {status.map(s => (s === 'loading' ? <span>Loading...</span> : null))}
        {status.map(s => (s === 'error' ? <span>Error requesting server</span> : null))}
      </div>
    </form>
  )
}
