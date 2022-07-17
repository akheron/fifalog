import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { useAuthStatusQuery } from '../auth/authApi'

import Layout from './Layout'
import LoginForm from './LoginForm'
import Main from './Main'
import Teams from './Teams'

export default React.memo(function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route
            index
            element={
              <LoginRequired>
                <Main />
              </LoginRequired>
            }
          />
          <Route
            path="/teams"
            element={
              <LoginRequired>
                <Teams />
              </LoginRequired>
            }
          />
          <Route path="*" element={<div>Not found :(</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
})

const LoginRequired = React.memo(function LoginRequired({
  children,
}: {
  children: JSX.Element
}) {
  const { data: loggedIn, isLoading } = useAuthStatusQuery()
  if (isLoading) {
    return null
  }
  if (!loggedIn) {
    return <Navigate to="/login" />
  }
  return children
})
