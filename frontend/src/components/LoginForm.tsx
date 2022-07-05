import classNames from 'classnames'
import React, { useCallback } from 'react'

import { useLoginMutation } from '../auth/authApi'
import { getErrorStatus } from '../utils/error'
import { useFormState, useTextField } from '../utils/formState'

import * as styles from './LoginForm.module.scss'

interface State {
  username: string
  password: string
}

export default React.memo(function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation()
  const errorStatus = getErrorStatus(error)

  const credentials = useFormState<State>({
    username: '',
    password: '',
  })
  const [username, setUsername] = useTextField(credentials, 'username')
  const [password, setPassword] = useTextField(credentials, 'password')

  const handleLogin = useCallback(async () => {
    await login(credentials.state)
  }, [login, credentials.state])

  return (
    <form
      className={classNames(styles.form, {
        [styles.invalid]: error !== undefined,
      })}
    >
      <h2>Login</h2>
      <div>
        <label>
          <span>Username:</span>{' '}
          <input value={username} onChange={setUsername} />
        </label>
      </div>
      <div>
        <label>
          <span>Password:</span>{' '}
          <input type="password" value={password} onChange={setPassword} />
        </label>
      </div>
      <div>
        <button disabled={isLoading} onClick={handleLogin}>
          Login
        </button>{' '}
        {isLoading ? (
          <span>Loading...</span>
        ) : errorStatus === 400 ? (
          <span>Login failed</span>
        ) : error ? (
          <span>Error requesting server</span>
        ) : null}
      </div>
    </form>
  )
})
