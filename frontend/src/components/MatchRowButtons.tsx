import { Property, combine } from 'baconjs'
import { Fragment, h } from 'harmaja'
import { ifElse } from '../atom-utils'
import * as Effect from '../effect'
import * as styles from './MatchRowButtons.scss'

export type Props = {
  editing: Property<boolean>
  disabled: Property<boolean>
  onEdit: () => void
  onCancel: () => void
  deleteMatch: Effect.Effect<void>
}

export default ({
  editing,
  disabled: disabledStatus,
  onEdit,
  onCancel,
  deleteMatch,
}: Props) => {
  const disabled = combine(
    disabledStatus,
    Effect.isPending(deleteMatch),
    (dis, del) => dis || del
  )
  return (
    <div className={styles.buttons}>
      {ifElse(
        editing,
        () => (
          <button disabled={disabled} onClick={onCancel}>
            cancel
          </button>
        ),
        () => (
          <>
            <button disabled={disabled} onClick={onEdit}>
              E
            </button>
            <button
              disabled={disabled}
              onClick={() => confirm('Really?') && deleteMatch.run()}
            >
              R
            </button>
          </>
        )
      )}
    </div>
  )
}
