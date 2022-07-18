import classNames from 'classnames'
import React, { MouseEvent, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLoginMutation } from '../auth/authApi'
import { getErrorStatus } from '../utils/error'
import { useFormState, useTextField } from '../utils/formState'

import * as styles from './LoginForm.module.css'

interface State {
  username: string
  password: string
}

export default React.memo(function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation()
  const errorStatus = getErrorStatus(error)

  const navigate = useNavigate()

  const credentials = useFormState<State>({
    username: '',
    password: '',
  })
  const [username, setUsername] = useTextField(credentials, 'username')
  const [password, setPassword] = useTextField(credentials, 'password')

  const handleLogin = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      const result = await login(credentials.state)
      if ('data' in result) {
        navigate('/')
      }
    },
    [login, credentials.state, navigate]
  )

  return (
    <form
      className={classNames({
        [styles.invalid]: error !== undefined,
      })}
    >
      <h2>Login</h2>
      <div className={styles.row}>
        <label>
          <span className={styles.name}>Username:</span>{' '}
          <input value={username} onChange={setUsername} />
        </label>
      </div>
      <div className={styles.row}>
        <label>
          <span className={styles.name}>Password:</span>{' '}
          <input type="password" value={password} onChange={setPassword} />
        </label>
      </div>
      <div className={styles.actions}>
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
