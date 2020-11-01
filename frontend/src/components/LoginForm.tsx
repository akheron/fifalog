import classNames from 'classnames'
import { atom, h } from 'harmaja/bacon'
import * as Effect from '../effect'
import Input from './Input'
import * as styles from './LoginForm.scss'

export type Props = {
  login: Effect.Effect<{ username: string; password: string }>
}

export default ({ login }: Props) => {
  const state = atom({ username: '', password: '' })
  return (
    <form
      className={Effect.ifSuccess(
        login,
        ok => !ok,
        () => false
      ).map(invalid => classNames(styles.form, { [styles.invalid]: invalid }))}
      onSubmit={e => {
        e.preventDefault()
        login.run(state.get())
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
        <button disabled={Effect.isPending(login)}>Login</button>{' '}
        {Effect.ifPending(
          login,
          () => (
            <span>Loading...</span>
          ),
          () => null
        )}
        {Effect.ifError(
          login,
          () => (
            <span>Error requesting server</span>
          ),
          () => null
        )}
      </div>
    </form>
  )
}
