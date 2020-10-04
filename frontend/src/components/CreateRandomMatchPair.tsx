import { Property } from 'baconjs'
import { Atom, h } from 'harmaja'
import { User } from '../../../common/types'
import { State } from '../state'
import { createRandomMatchPair } from '../mutations'
import RandomizeButton from './RandomizeButton'
import UserSelect from './UserSelect'

const CreateRandomMatchPair = (props: {
  users: Property<User[]>
  matches: Atom<State.MatchRow[]>
  state: Atom<State.Create>
}) => (
  <div>
    <UserSelect users={props.users} selectedUser={props.state.view('user1')} />
    {' vs. '}
    <UserSelect
      users={props.users}
      selectedUser={props.state.view('user2')}
    />{' '}
    {props.state.map(({ user1, user2 }) => (
      <RandomizeButton
        disabled={user1 === user2}
        onClick={() => createRandomMatchPair(props.matches, [user1, user2])}
        title="Create random match pair"
      />
    ))}
  </div>
)

export default CreateRandomMatchPair
