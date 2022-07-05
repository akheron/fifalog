import React from 'react'

import { useAuthStatusQuery } from '../auth/authApi'

import Index from './Index'
import LoginForm from './LoginForm'
import Logout from './Logout'
import './App.scss'

export default React.memo(function App() {
  const { data: loggedIn, isLoading } = useAuthStatusQuery()
  return (
    <main>
      {isLoading ? (
        <div>Loading...</div>
      ) : loggedIn ? (
        <>
          <Logout />
          <Index />
        </>
      ) : (
        <LoginForm />
      )}
    </main>
  )
})
