import React, { useCallback, MouseEvent } from "react";
import { Link, Outlet } from 'react-router-dom'

import { useAuthStatusQuery, useLogoutMutation } from '../auth/authApi'

import * as styles from './Layout.module.css'

export default React.memo(function Layout() {
  const { data: isLoggedIn } = useAuthStatusQuery()
  return (
    <main className={styles.main}>
      {isLoggedIn ? <Menu /> : null}
      <Outlet />
    </main>
  )
})

const Menu = React.memo(function Menu() {
  return (
    <div className={styles.menu}>
      <Link to="/">Home</Link>
      <Gap />
      <Link to="/teams">Teams</Link>
      <Filler />
      <LogoutButton />
    </div>
  )
})

const LogoutButton = React.memo(function LogoutButton() {
  const [logout, { isLoading }] = useLogoutMutation()
  return (
    <button className={styles.logout} disabled={isLoading} onClick={() => logout()}>
      Sign out
    </button>
  )
})

const Gap = React.memo(function Gap() {
  return <span className={styles.gap} />
})

const Filler = React.memo(function GrowingGap() {
  return <span className={styles.filler} />
})
