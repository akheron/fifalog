import * as R from 'ramda'
import { Atom, ListView, atom, h } from 'harmaja'
import { MatchResultBody } from '../../../common/types'
import MatchRow, {
  State as MatchState,
  initialState as initialMatchState,
} from './MatchRow'
import * as styles from './MatchList.scss'

// Re-export
export { MatchState, initialMatchState }

function groupByDate(items: Atom<MatchState[]>): Atom<MatchState[][]> {
  const property = items.map(R.groupWith(eqDate))
  const onChange = (groups: MatchState[][]) => {
    items.set(groups.flat())
  }
  return atom(property, onChange)
}

const groupFinishedDate = (group: MatchState[]) => finishedDate(group[0])

const finishedDate: (match: MatchState) => string = R.pathOr('Not played yet', [
  'result',
  'finishedDate',
])

const eqDate = (a: MatchState, b: MatchState): boolean =>
  finishedDate(a) === finishedDate(b)

export type Props = {
  matches: Atom<MatchState[]>
  onFinishMatch: (matchId: number, result: MatchResultBody) => void
  onDeleteMatch: (matchId: number) => void
}

export default ({ matches, onFinishMatch, onDeleteMatch }: Props) => (
  <ListView
    atom={groupByDate(matches)}
    getKey={g => groupFinishedDate(g)}
    renderAtom={(_, group) => (
      <div>
        <div className={styles.date}>{group.map(groupFinishedDate)}</div>
        <ListView
          atom={group}
          getKey={match => match.id}
          renderAtom={(matchId: number, match) => (
            <MatchRow
              match={match}
              onFinish={result => onFinishMatch(matchId, result)}
              onDelete={() => onDeleteMatch(matchId)}
            />
          )}
        />
      </div>
    )}
  />
)
