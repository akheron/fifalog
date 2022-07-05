import React from 'react'

import { MonthStats, useStatsQuery } from '../stats/statsApi'

import * as styles from './Stats.module.scss'

export default React.memo(function Stats() {
  const { data, isLoading } = useStatsQuery()
  if (isLoading) return <div>Loading...</div>
  return (
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
      {data?.map((month) => (
        <Month key={month.month} stats={month} />
      ))}
    </table>
  )
})

const Month = React.memo(function Month(props: { stats: MonthStats }) {
  return (
    <tbody>
      {props.stats.userStats.map((user, index) => (
        <tr key={user.user.id}>
          <td>{index == 0 ? props.stats.month : null}</td>
          <td>{user.user.name}</td>
          <td>{user.wins}</td>
          <td>({user.overTimeWins} OT)</td>
          <td>{user.goalsFor}</td>
        </tr>
      ))}
      <tr key="total">
        <td />
        <td>Total</td>
        <td>{props.stats.matches}</td>
        <td>({props.stats.ties} tied)</td>
        <td>{props.stats.goals}</td>
      </tr>
    </tbody>
  )
})
