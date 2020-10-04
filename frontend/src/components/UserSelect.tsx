import { Property } from 'baconjs'
import { Atom, ListView, h } from 'harmaja'
import { User } from '../../../common/types'

const UserSelect = (props: {
  users: Property<User[]>
  selectedUser: Atom<number>
}) => (
  <select
    onChange={e => props.selectedUser.set(parseInt(e.currentTarget.value))}
  >
    <ListView
      observable={props.users}
      renderItem={user => (
        <option
          selected={props.selectedUser.map(id => user.id === id)}
          value={user.id}
        >
          {user.name}
        </option>
      )}
    />
  </select>
)

export default UserSelect
