import React from 'react'
import * as styles from './Logout.scss'
import { useLogoutMutation } from '../auth/authApi'

export default React.memo(function Logout() {
  const [logout, { isLoading }] = useLogoutMutation()
  return (
    <button
      className={styles.logout}
      disabled={isLoading}
      onClick={() => logout()}
    >
      Sign out
    </button>
  )
})
