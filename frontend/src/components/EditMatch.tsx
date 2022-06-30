import React, { useCallback, useMemo } from 'react'
import { MatchResultBody, useFinishMatchMutation } from '../matches/matchesApi'
import { useFormState, useSelect, useTextField } from '../utils/formState'
import * as styles from './EditMatch.scss'

export interface State {
  homeScore: string
  awayScore: string
  finishedType: FinishedType
  homePenaltyGoals: string
  awayPenaltyGoals: string
}

type FinishedType = 'fullTime' | 'overTime' | 'penalties'

export interface Props {
  id: number
}

export default React.memo(function EditMatch({ id }: Props) {
  const state = useFormState<State>({
    homeScore: '',
    awayScore: '',
    finishedType: 'fullTime',
    homePenaltyGoals: '',
    awayPenaltyGoals: '',
  })

  const [homeScore, setHomeScore] = useTextField(state, 'homeScore')
  const [awayScore, setAwayScore] = useTextField(state, 'awayScore')
  const [finishedType, setFinishedType] = useSelect(state, 'finishedType')
  const [homePenaltyGoals, setHomePenaltyGoals] = useTextField(
    state,
    'homePenaltyGoals'
  )
  const [awayPenaltyGoals, setAwayPenaltyGoals] = useTextField(
    state,
    'awayPenaltyGoals'
  )
  const validatedData = useMemo(() => validate(state.state), [state.state])

  const [finishMatch] = useFinishMatchMutation()
  const handleSave = useCallback(() => {
    if (!validatedData) return
    finishMatch({ id, result: validatedData })
  }, [validatedData, finishMatch])

  return (
    <div className={styles.editMatch}>
      <input inputMode="numeric" value={homeScore} onChange={setHomeScore} />
      {' - '}
      <input
        inputMode="numeric"
        value={awayScore}
        onChange={setAwayScore}
      />{' '}
      <select value={finishedType} onChange={setFinishedType}>
        <option value="fullTime">full time</option>
        <option value="overTime">overtime</option>
        <option value="penalties">penalties</option>
      </select>
      {finishedType === 'penalties' ? (
        <small>
          {' ('}
          <input
            inputMode="numeric"
            value={homePenaltyGoals}
            onChange={setHomePenaltyGoals}
          />
          {' - '}
          <input
            inputMode="numeric"
            value={awayPenaltyGoals}
            onChange={setAwayPenaltyGoals}
          />
          {' P)'}
        </small>
      ) : null}{' '}
      <button disabled={!validatedData} onClick={handleSave}>
        save
      </button>
    </div>
  )
})

function stringToInt(s: string): number | undefined {
  if (!/^\d+$/.test(s)) return undefined
  return parseInt(s, 10)
}

function validate(state: State): MatchResultBody | undefined {
  const homeScore = stringToInt(state.homeScore)
  const awayScore = stringToInt(state.awayScore)
  if (homeScore === undefined || awayScore === undefined) return undefined

  if (state.finishedType === 'penalties') {
    const homePenaltyGoals = stringToInt(state.homePenaltyGoals)
    const awayPenaltyGoals = stringToInt(state.awayPenaltyGoals)
    if (homePenaltyGoals === undefined || awayPenaltyGoals === undefined) {
      return undefined
    }

    return {
      homeScore,
      awayScore,
      finishedType: {
        kind: 'penalties',
        homeGoals: homePenaltyGoals,
        awayGoals: awayPenaltyGoals,
      },
    }
  }
  return {
    homeScore: homeScore,
    awayScore: awayScore,
    finishedType: { kind: state.finishedType },
  }
}
