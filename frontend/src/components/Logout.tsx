import { Atom, h } from 'harmaja'
import * as mutations from '../mutations'
import { State } from '../state'
import * as styles from './Logout.scss'

const Logout = (props: { state: Atom<State> }) => (
  <a
    className={styles.logout}
    href="#"
    onClick={e => {
      e.preventDefault()
      mutations.logout(props.state)
    }}
  >
    Sign out
  </a>
)

export default Logout
