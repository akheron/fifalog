import React from 'react'

import { useAuthStatusQuery } from '../auth/authApi'

import LoginForm from './LoginForm'
import Logout from './Logout'
import Main from './Main'
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
          <Main />
        </>
      ) : (
        <LoginForm />
      )}
    </main>
  )
})
