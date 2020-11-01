import { Property } from 'baconjs'
import { ListView, h } from 'harmaja/bacon'
import { Stats } from '../../../common/types'
import * as styles from './Stats.scss'

export type Props = { stats: Property<Stats[]> }

export default ({ stats }: Props) => (
  <table className={styles.stats}>
    <thead>
      <tr>
        <th></th>
        <th></th>
        <th>W</th>
        <th></th>
        <th>G</th>
      </tr>
    </thead>
    <ListView
      observable={stats}
      renderItem={monthStats => <MonthStats stats={monthStats} />}
    />
  </table>
)

const MonthStats = (props: { stats: Stats }) => (
  <tbody>
    {props.stats.userStats.map((user, index) => (
      <tr>
        <td>{index == 0 ? props.stats.month : null}</td>
        <td>{user.user.name}</td>
        <td>{user.wins}</td>
        <td>({user.overTimeWins} OT)</td>
        <td>{user.goalsFor}</td>
      </tr>
    ))}
    <tr>
      <td />
      <td>Total</td>
      <td>{props.stats.matches}</td>
      <td>({props.stats.ties} tied)</td>
      <td>{props.stats.goals}</td>
    </tr>
  </tbody>
)
