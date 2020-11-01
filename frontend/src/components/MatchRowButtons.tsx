import { Property } from 'baconjs'
import { Atom, Fragment, h } from 'harmaja/bacon'
import { ifElse } from '../atom-utils'
import * as styles from './MatchRowButtons.scss'

export type Props = {
  editing: Atom<boolean>
  disabled: Property<boolean>
  onDelete: () => void
}

export default ({ editing, disabled, onDelete }: Props) => (
  <div className={styles.buttons}>
    {ifElse(
      editing,
      () => (
        <button disabled={disabled} onClick={() => editing.set(false)}>
          cancel
        </button>
      ),
      () => (
        <>
          <button disabled={disabled} onClick={() => editing.set(true)}>
            E
          </button>
          <button
            disabled={disabled}
            onClick={() => confirm('Really?') && onDelete()}
          >
            R
          </button>
        </>
      )
    )}
  </div>
)
