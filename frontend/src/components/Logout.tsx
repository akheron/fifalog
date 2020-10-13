import { h } from 'harmaja'
import * as styles from './Logout.scss'

export type Props = { onLogout: () => void }

const Logout = ({ onLogout }: Props) => (
  <a
    className={styles.logout}
    href="#"
    onClick={e => {
      e.preventDefault()
      onLogout()
    }}
  >
    Sign out
  </a>
)

export default Logout
