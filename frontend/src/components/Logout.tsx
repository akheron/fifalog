import { h, onUnmount } from 'harmaja'
import * as Effect from '../effect'
import * as styles from './Logout.scss'

export type Props = {
  logout: Effect.Effect<void>
}

export default ({ logout }: Props) => {
  const unsub = Effect.onError(logout, () => alert('Error requesting server'))
  onUnmount(unsub)

  return (
    <button
      className={styles.logout}
      disabled={Effect.isPending(logout)}
      onClick={e => {
        e.preventDefault()
        logout.run()
      }}
    >
      Sign out
    </button>
  )
}
