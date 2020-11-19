import { Atom, h } from 'harmaja/bacon'
import * as styles from './Input.scss'

export type Props = {
  type?: JSX.InputHTMLAttributes<any>['type']
  inputMode?: JSX.InputHTMLAttributes<any>['inputMode']
  value: Atom<string>
}

export default ({ type = 'text', inputMode, value }: Props) => (
  <input
    className={styles.input}
    type={type}
    inputMode={inputMode}
    value={value}
    onInput={e => {
      value.set(e.target.value)
    }}
  />
)
