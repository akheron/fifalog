import React from 'react'

import { useLogoutMutation } from '../auth/authApi'

import * as styles from './Logout.module.scss'

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
