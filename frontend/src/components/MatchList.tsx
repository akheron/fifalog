import * as R from 'ramda'
import { Atom, ListView, atom, h } from 'harmaja'
import { Match, MatchResultBody } from '../../../common/types'
import MatchRow from './MatchRow'
import * as styles from './MatchList.scss'

function groupByDate(items: Atom<Match[]>): Atom<Match[][]> {
  const property = items.map(R.groupWith(eqDate))
  const onChange = (groups: Match[][]) => {
    items.set(groups.flat())
  }
  return atom(property, onChange)
}

const groupFinishedDate = (group: Match[]) => finishedDate(group[0])

const finishedDate: (match: Match) => string = R.pathOr('Not played yet', [
  'result',
  'finishedDate',
])

const eqDate = (a: Match, b: Match): boolean =>
  finishedDate(a) === finishedDate(b)

export type Props = {
  matches: Atom<Match[]>
  onFinishMatch: (matchId: number, result: MatchResultBody) => void
  onDeleteMatch: (matchId: number) => void
}

export default ({ matches, onFinishMatch, onDeleteMatch }: Props) => {
  return (
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
}
