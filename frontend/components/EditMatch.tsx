import * as React from 'react'
import { either } from 'fp-ts'
import { pipe } from 'fp-ts/es6/pipeable'
import { Atom, Lens, F, bind } from '@grammarly/focal'
import {
  MatchResult as BackendMatchResult,
  MatchResultBody,
} from '../../common/types'
import { makeMatchResultBodyCodec } from '../../common/codecs'
import { State } from '../state'
import * as styles from './EditMatch.scss'

const finishedTypeLens = Lens.create<
  BackendMatchResult.FinishedTypeString,
  'fullTime' | 'overTime' | 'penalties'
>(
  s => s.kind,
  v =>
    v == 'fullTime' || v == 'overTime'
      ? { kind: v }
      : { kind: 'penalties', homeGoals: '', awayGoals: '' }
)

const penaltiesLens = (field: 'homeGoals' | 'awayGoals') =>
  Lens.create<BackendMatchResult.FinishedTypeString, string>(
    s => (s as BackendMatchResult.Penalties<string>)[field],
    (v, s) => ({
      ...(s as BackendMatchResult.Penalties<string>),
      kind: 'penalties',
      [field]: v,
    })
  )

const matchResultBody = makeMatchResultBodyCodec('string')

const convertEdit = (edit: State.EditMatch): MatchResultBody | null =>
  pipe<any, MatchResultBody | null>(
    matchResultBody.decode(edit),
    either.getOrElse(() => null)
  )

const EditMatch = (props: {
  edit: Atom<Exclude<State.EditMatch, null>>
  onSave: (result: MatchResultBody) => void
}) => (
  <F.div className={styles.editMatch}>
    <F.input type="text" {...bind({ value: props.edit.lens('homeScore') })} />
    {' - '}
    <F.input
      type="text"
      {...bind({ value: props.edit.lens('awayScore') })}
    />{' '}
    <F.select
      {...bind({
        value: props.edit.lens('finishedType').lens(finishedTypeLens),
      })}
    >
      <option value="fullTime">full time</option>
      <option value="overTime">overtime</option>
      <option value="penalties">penalties</option>
    </F.select>
    {props.edit.lens('finishedType').view(
      finishedType =>
        finishedType.kind === 'penalties' && (
          <small key="penalties">
            {' '}
            (
            <F.input
              type="text"
              {...bind({
                value: props.edit
                  .lens('finishedType')
                  .lens(penaltiesLens('homeGoals')),
              })}
            />
            {' - '}
            <F.input
              type="text"
              {...bind({
                value: props.edit
                  .lens('finishedType')
                  .lens(penaltiesLens('awayGoals')),
              })}
            />{' '}
            P)
          </small>
        )
    )}{' '}
    <F.button
      disabled={props.edit.view(e => !convertEdit(e))}
      onClick={() => {
        const result = convertEdit(props.edit.get())
        if (result) props.onSave(result)
      }}
    >
      save
    </F.button>
  </F.div>
)

export default EditMatch
