import { createSlice } from '@reduxjs/toolkit'

import { authApi } from './authApi'

// Server-side rendered
declare const IS_LOGGED_IN: boolean | undefined

export interface AuthState {
  loggedIn: boolean
}

const initialState: AuthState = {
  loggedIn: IS_LOGGED_IN ?? false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state) => {
        state.loggedIn = true
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.loggedIn = false
      })
  },
})

export default authSlice.reducer
