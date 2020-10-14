import { Property, combine } from 'baconjs'
import { Fragment, h } from 'harmaja'
import { User } from '../../../common/types'
import { definedOr, editAtom } from '../atom-utils'
import { Status } from '../status'
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
  status: Property<Status>
  onCreate: (userIds: [number, number]) => void
}

export default ({ users, status, onCreate }: Props) => {
  const maybeState = editAtom(users.map(init))
  return definedOr(
    maybeState,
    state => {
      const disabled = combine(
        state,
        status,
        ({ user1, user2 }, s) => user1 === user2 || s === 'loading'
      )
      return (
        <>
          <Select items={users} value={state.view('user1')} />
          {' vs. '}
          <Select items={users} value={state.view('user2')} />{' '}
          <RandomizeButton
            title="Create random match pair"
            disabled={disabled}
            onClick={() => {
              const { user1, user2 } = state.get()
              onCreate([user1, user2])
            }}
          />{' '}
          {status.map(s =>
            s === 'loading'
              ? '...'
              : s === 'error'
              ? 'Could not create match'
              : null
          )}
        </>
      )
    },
    () => null
  )
}
