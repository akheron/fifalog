import React from 'react'
import { useAppSelector } from '../store'
import LoginForm from './LoginForm'
import Logout from './Logout'
import Index from './Index'
import './App.scss'

export default React.memo(function App() {
  const loggedIn = useAppSelector((state) => state.auth.loggedIn)
  return (
    <main>
      {loggedIn ? (
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
