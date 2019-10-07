import * as React from 'react'
import { Stats } from '../../../common/types'
import * as styles from './Stats.scss'

const Stats = (props: { stats: Stats[] }) => (
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
    {props.stats.map(monthStats => (
      <MonthStats key={monthStats.month} stats={monthStats} />
    ))}
  </table>
)

const MonthStats = (props: { stats: Stats }) => (
  <tbody>
    {props.stats.userStats.map((user, index) => (
      <tr key={index}>
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

export default Stats
