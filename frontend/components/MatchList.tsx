import * as React from 'react'
import { Atom, F } from '@grammarly/focal'
import { deleteMatch } from '../mutations'
import { State } from '../state'
import { indexLens, NonNullAtom } from '../utils'
import MatchRow from './MatchRow'

const MatchList = (props: { rows: Atom<State.MatchRow[]> }) => (
  <F.div>
    {props.rows.view(rows =>
      rows.map((row, i) => (
        <MatchRow
          key={row.match.id}
          row={new NonNullAtom(props.rows.lens(indexLens<State.MatchRow>(i)))}
          onRemove={() =>
            confirm('Really?') && deleteMatch(props.rows, row.match.id)
          }
        />
      ))
    )}
  </F.div>
)

export default MatchList
