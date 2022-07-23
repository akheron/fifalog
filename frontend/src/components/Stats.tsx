import React from 'react'

import { MonthStats, useStatsQuery } from '../stats/statsApi'

import * as styles from './Stats.module.css'
import { useBooleanState } from '../utils/state'
import { VGap } from './whitespace'

export default React.memo(function Stats() {
  const { data, isLoading } = useStatsQuery()
  const expand = useBooleanState(false)

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Error loading stats</div>

  const first5 = data.slice(0, 5)
  const rest = data.slice(5)

  return (
    <>
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
        {first5.map((month) => (
          <Month key={month.month} stats={month} />
        ))}
        {expand.value
          ? rest.map((month) => <Month key={month.month} stats={month} />)
          : null}
      </table>
      <VGap />
      {rest.length > 0 ? (
        <div>
          <button onClick={expand.toggle}>
            show {rest.length} {expand.value ? 'less' : 'more'}
          </button>
        </div>
      ) : null}
    </>
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
