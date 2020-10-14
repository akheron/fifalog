import { Property } from 'baconjs'
import { Fragment, h } from 'harmaja'
import { ifElse } from '../atom-utils'
import * as styles from './MatchRowButtons.scss'

export type Props = {
  editing: Property<boolean>
  disabled: Property<boolean>
  onEdit: () => void
  onCancel: () => void
  onDelete: () => void
}

export default ({ editing, disabled, onEdit, onCancel, onDelete }: Props) => (
  <div className={styles.buttons}>
    {ifElse(
      editing,
      () => (
        <button disabled={disabled} onClick={onCancel}>cancel</button>
      ),
      () => (
        <>
          <button disabled={disabled} onClick={onEdit}>E</button>
          <button disabled={disabled} onClick={onDelete}>R</button>
        </>
      )
    )}
  </div>
)
