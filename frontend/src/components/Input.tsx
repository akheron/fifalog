import { Atom, h } from 'harmaja/bacon'
import * as styles from './Input.scss'

export type Props = {
  type?: 'text' | 'number' | 'password'
  value: Atom<string>
}

export default ({ type = 'text', value }: Props) => (
  <input
    className={styles.input}
    type={type}
    value={value}
    onInput={e => {
      value.set(e.target.value)
    }}
  />
)
