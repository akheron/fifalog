import * as React from 'react'
import { Atom } from '@grammarly/focal'
import * as mutations from '../mutations'
import { State } from '../state'
import * as styles from './Logout.scss'

const logout = (state: Atom<State>) => (e: React.SyntheticEvent) => {
  e.preventDefault()
  mutations.logout(state)
}

const Logout = (props: { state: Atom<State> }) => (
  <a className={styles.logout} href="#" onClick={logout(props.state)}>
    Sign out
  </a>
)

export default Logout
