import * as R from 'ramda'
import { Atom, Fragment, ListView, atom, h } from 'harmaja'
import { Stats } from '../../../common/types'
import { deleteMatch } from '../mutations'
import { State } from '../state'
import MatchRow from './MatchRow'
import * as styles from './MatchList.scss'

function groupByDate(items: Atom<State.MatchRow[]>): Atom<State.MatchRow[][]> {
  const property = items.map(R.groupWith(eqDate))
  const onChange = (groups: State.MatchRow[][]) => {
    items.set(groups.flat())
  }
  return atom(property, onChange)
}

const MatchList = (props: {
  rows: Atom<State.MatchRow[]>
  stats: Atom<Stats[]>
}) => {
  return (
    <ListView
      atom={groupByDate(props.rows)}
      getKey={g => g[0].match.id}
      renderAtom={(_, group) => (
        <div>
          <div className={styles.date}>{group.map(groupFinishedDate)}</div>
          <ListView
            atom={group}
            getKey={row => row.match.id}
            renderAtom={(_, row) =>
              row
                .view('match')
                .view('id')
                .map(matchId => (
                  <MatchRow
                    row={row}
                    rows={props.rows}
                    stats={props.stats}
                    onRemove={() =>
                      confirm('Really?') && deleteMatch(props.rows, matchId)
                    }
                  />
                ))
            }
          />
        </div>
      )}
    />
  )
}

export default MatchList

const groupFinishedDate = (group: State.MatchRow[]) => finishedDate(group[0])

const finishedDate: (
  match: State.MatchRow
) => string | null = R.pathOr('Not played yet', [
  'match',
  'result',
  'finishedDate',
])

const eqDate = (a: State.MatchRow, b: State.MatchRow): boolean =>
  finishedDate(a) === finishedDate(b)

const indexOf = (
  arr: any[][],
  outerIndex: number,
  innerIndex: number
): number =>
  R.sum(arr.slice(0, outerIndex).map(innerArr => innerArr.length)) + innerIndex
