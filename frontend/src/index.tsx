import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './components/App'
import { store } from './store'

const el = document.getElementById('app')
if (el) {
  createRoot(el).render(
    <Provider store={store}>
      <App />
    </Provider>
  )
}
