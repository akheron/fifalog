import { Property } from 'baconjs'
import { Fragment, h } from 'harmaja'
import { User } from '../../../common/types'
import { definedOr, editAtom } from '../atom-utils'
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
  onCreate: (userIds: [number, number]) => void
}

export default ({ users, onCreate }: Props) => {
  const maybeState = editAtom(users.map(init))
  return definedOr(
    maybeState,
    state => (
      <>
        <Select items={users} value={state.view('user1')} />
        {' vs. '}
        <Select items={users} value={state.view('user2')} />{' '}
        {state.map(({ user1, user2 }) => (
          <RandomizeButton
            title="Create random match pair"
            disabled={state.map(({ user1, user2 }) => user1 === user2)}
            onClick={() => onCreate([user1, user2])}
          />
        ))}
      </>
    ),
    () => null
  )
}
