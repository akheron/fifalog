import { Atom, Fragment, h } from 'harmaja'
import { ifElse } from '../atom-utils'
import * as styles from './MatchRowButtons.scss'

export type Props = {
  editing: Atom<boolean>
  onEdit: () => void
  onCancel: () => void
  onRemove: () => void
}

export default ({ editing, onEdit, onCancel, onRemove }: Props) => (
  <div className={styles.buttons}>
    {ifElse(
      editing,
      () => (
        <button onClick={onCancel}>cancel</button>
      ),
      () => (
        <>
          <button onClick={onEdit}>E</button>
          <button onClick={onRemove}>R</button>
        </>
      )
    )}
  </div>
)
