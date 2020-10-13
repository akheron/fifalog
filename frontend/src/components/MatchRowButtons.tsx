import { Atom, Fragment, h } from 'harmaja'
import { EditMatch } from '../state'
import * as styles from './MatchRowButtons.scss'

const MatchRowButtons = (props: {
  edit: Atom<EditMatch>
  onRemove: () => void
}) => (
  <div className={styles.buttons}>
    {props.edit.map(edit =>
      edit ? (
        <button onClick={() => props.edit.set(cancelEdit)}>cancel</button>
      ) : (
        <>
          <button onClick={() => props.edit.set(beginEdit)}>E</button>
          <button onClick={props.onRemove}>R</button>
        </>
      )
    )}
  </div>
)

export default MatchRowButtons

const beginEdit: EditMatch = {
  homeScore: '',
  awayScore: '',
  finishedType: { kind: 'fullTime' },
}

const cancelEdit: EditMatch = null
