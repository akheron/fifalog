import * as R from 'ramda'
import { Atom, ListView, atom, h } from 'harmaja'
import { Stats } from '../../../common/types'
import { deleteMatch } from '../mutations'
import { MatchRow } from '../state'
import MatchRowComponent from './MatchRow'
import * as styles from './MatchList.scss'

function groupByDate(items: Atom<MatchRow[]>): Atom<MatchRow[][]> {
  const property = items.map(R.groupWith(eqDate))
  const onChange = (groups: MatchRow[][]) => {
    items.set(groups.flat())
  }
  return atom(property, onChange)
}

const MatchList = (props: {
  rows: Atom<MatchRow[]>
  stats: Atom<Stats[]>
}) => {
  return (
    <ListView
      atom={groupByDate(props.rows)}
      getKey={g => groupFinishedDate(g)}
      renderAtom={(_, group) => (
        <div>
          <div className={styles.date}>{group.map(groupFinishedDate)}</div>
          <ListView
            atom={group}
            getKey={row => row.match.id}
            renderAtom={(_, row) => (
              // This intermediary div is needed because of https://github.com/raimohanska/harmaja/pull/23
              <div>
                {row
                  .view('match')
                  .view('id')
                  .map(matchId => (
                    <MatchRowComponent
                      row={row}
                      rows={props.rows}
                      stats={props.stats}
                      onRemove={() =>
                        confirm('Really?') && deleteMatch(props.rows, matchId)
                      }
                    />
                  ))}
              </div>
            )}
          />
        </div>
      )}
    />
  )
}

export default MatchList

const groupFinishedDate = (group: MatchRow[]) => finishedDate(group[0])

const finishedDate: (
  match: MatchRow
) => string = R.pathOr('Not played yet', ['match', 'result', 'finishedDate'])

const eqDate = (a: MatchRow, b: MatchRow): boolean =>
  finishedDate(a) === finishedDate(b)
