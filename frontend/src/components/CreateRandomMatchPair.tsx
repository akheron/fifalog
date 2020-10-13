import { Property } from 'baconjs'
import { Atom, Fragment, h } from 'harmaja'
import { User } from '../../../common/types'
import { MatchRow } from '../state'
import { definedOr, editAtom } from '../atom-utils'
import { createRandomMatchPair } from '../mutations'
import RandomizeButton from './RandomizeButton'
import Select from './Select'

type ComponentState = {
  user1: number
  user2: number
}

function init(users: User[]): ComponentState | undefined {
  if (users.length >= 2) {
    return { user1: users[0].id, user2: users[1].id }
  }
  return undefined
}

const CreateRandomMatchPair = (props: {
  users: Property<User[]>
  matches: Atom<MatchRow[]>
}) => {
  const maybeState = editAtom(props.users.map(init))
  return definedOr(
    maybeState,
    state => (
      <>
        <Select items={props.users} value={state.view('user1')} />
        {' vs. '}
        <Select items={props.users} value={state.view('user2')} />{' '}
        {state.map(({ user1, user2 }) => (
          <RandomizeButton
            disabled={user1 === user2}
            onClick={() => createRandomMatchPair(props.matches, [user1, user2])}
            title="Create random match pair"
          />
        ))}
      </>
    ),
    () => null
  )
}

export default CreateRandomMatchPair
