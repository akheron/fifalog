import React from 'react'
import { Outlet } from 'react-router-dom'

import { useAuthStatusQuery } from '../auth/authApi'

import Logout from './Logout'
import './Layout.scss'

export default React.memo(function Layout() {
  const { data: isLoggedIn } = useAuthStatusQuery()
  return (
    <main>
      {isLoggedIn ? <Logout /> : null}
      <Outlet />
    </main>
  )
})
