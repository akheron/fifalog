import { Property, combine } from 'baconjs'
import { Fragment, h } from 'harmaja/bacon'
import { User } from '../../../common/types'
import { definedOr, editAtom } from '../atom-utils'
import * as Effect from '../effect'
import RandomizeButton from './RandomizeButton'
import Select from './Select'

export type State = {
  user1: number
  user2: number
}

function init(users: User[]): State | undefined {
  if (users.length >= 2) {
    return { user1: users[0].id, user2: users[1].id }
  }
  return undefined
}

export type Props = {
  users: Property<User[]>
  create: Effect.Effect<[number, number]>
}

export default ({ users, create }: Props) => {
  const maybeState = editAtom(users.map(init))
  return definedOr(
    maybeState,
    state => {
      const disabled = combine(
        state,
        Effect.isPending(create),
        ({ user1, user2 }, creating) => user1 === user2 || creating
      )
      return (
        <>
          {ifLongerThan(users, 2, () => (
            <>
              <Select items={users} value={state.view('user1')} />
              {' vs. '}
              <Select items={users} value={state.view('user2')} />{' '}
            </>
          ))}
          <RandomizeButton
            title="Create random match pair"
            disabled={disabled}
            onClick={() => {
              const { user1, user2 } = state.get()
              create.run([user1, user2])
            }}
          />{' '}
          {Effect.ifPending(
            create,
            () => '...',
            () => null
          )}
          {Effect.ifError(
            create,
            () => 'Could not create match',
            () => null
          )}
        </>
      )
    },
    () => null
  )
}

const ifLongerThan = (
  obs: Property<unknown[]>,
  len: number,
  fn: () => HarmajaOutput
): HarmajaOutput =>
  obs
    .map(value => value.length > len)
    .skipDuplicates()
    .map(show => (show ? fn() : null))
