import * as React from 'react'
import * as R from 'ramda'
import { Atom, F } from '@grammarly/focal'
import { Stats } from '../../common/types'
import { deleteMatch } from '../mutations'
import { State } from '../state'
import { indexLens, NonNullAtom } from '../utils'
import MatchRow from './MatchRow'
import * as styles from './MatchList.scss'

const MatchList = (props: {
  rows: Atom<State.MatchRow[]>
  stats: Atom<Stats[]>
}) => (
  <F.div>
    {props.rows.view(r =>
      R.groupWith(eqDate, r).map(rowss => (
        <>
          <div className={styles.date}>{finishedDate(rowss[0])}</div>
          {rowss.map((row, i) => (
            <MatchRow
              key={row.match.id}
              row={
                new NonNullAtom(props.rows.lens(indexLens<State.MatchRow>(i)))
              }
              stats={props.stats}
              onRemove={() =>
                confirm('Really?') && deleteMatch(props.rows, row.match.id)
              }
            />
          ))}
        </>
      ))
    )}
  </F.div>
)

export default MatchList

const finishedDate: (m: State.MatchRow) => string | null = R.pathOr(null, [
  'match',
  'result',
  'finishedDate',
])

const eqDate = (a: State.MatchRow, b: State.MatchRow): boolean =>
  finishedDate(a) === finishedDate(b)
