import React from 'react'
import { Link, Outlet } from 'react-router-dom'

import { useAuthStatusQuery, useLogoutMutation } from '../auth/authApi'

import './Layout.scss'

export default React.memo(function Layout() {
  const { data: isLoggedIn } = useAuthStatusQuery()
  return (
    <main>
      {isLoggedIn ? <Menu /> : null}
      <Outlet />
    </main>
  )
})

const Menu = React.memo(function Menu() {
  return (
    <div>
      <Link to="/">Home</Link>
      <Gap />
      <Link to="/teams">Teams</Link>
      <Gap />
      <LogoutButton />
    </div>
  )
})

const LogoutButton = React.memo(function LogoutButton() {
  const [logout, { isLoading }] = useLogoutMutation()
  return (
    <button disabled={isLoading} onClick={() => logout()}>
      Sign out
    </button>
  )
})

const Gap = React.memo(function Gap() {
  return <span style={{ marginRight: 20 }} />
})
