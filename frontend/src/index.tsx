import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'
import { Provider } from 'react-redux'
import { store } from './store'

let el = document.getElementById('app')
if (el) {
  createRoot(el).render(
    <Provider store={store}>
      <App />
    </Provider>
  )
}
