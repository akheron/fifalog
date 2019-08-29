import * as React from 'react'
import { Atom, F } from '@grammarly/focal'
import { State } from '../state'
import * as styles from './MatchRowButtons.scss'

const MatchRowButtons = (props: {
  edit: Atom<State.EditMatch>
  onRemove: () => void
}) => (
  <F.div className={styles.buttons}>
    {props.edit.view(edit =>
      edit ? (
        <button onClick={() => props.edit.modify(cancelEdit)}>cancel</button>
      ) : (
        <>
          <button onClick={() => props.edit.modify(beginEdit)}>edit</button>
          <button onClick={props.onRemove}>remove</button>
        </>
      )
    )}
  </F.div>
)

export default MatchRowButtons

const beginEdit = (): State.EditMatch => ({
  homeScore: '',
  awayScore: '',
  finishedType: { kind: 'fullTime' },
})

const cancelEdit = (): State.EditMatch => null
