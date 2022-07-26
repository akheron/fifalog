import React from 'react'
import { Link, Outlet } from 'react-router-dom'

import { useAuthStatusQuery, useLogoutMutation } from '../auth/authApi'

import * as styles from './Layout.module.css'
import TextButton from './TextButton'
import { Filler, HGap } from './whitespace'

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
      <HGap size="M" />
      <Link to="/teams">Teams</Link>
      <Filler />
      <LogoutButton />
    </div>
  )
})

const LogoutButton = React.memo(function LogoutButton() {
  const [logout, { isLoading }] = useLogoutMutation()
  return (
    <TextButton
      className={styles.logout}
      disabled={isLoading}
      onClick={() => logout()}
    >
      Sign out
    </TextButton>
  )
})
