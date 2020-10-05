import { Property } from 'baconjs'
import { Atom, ListView, h } from 'harmaja'
import { User } from '../../../common/types'

interface Item {
  id: number
  name: string
}

const Select = (props: {
  items: Property<Item[]>
  value: Atom<number>
}) => (
  <select
    onChange={e => props.value.set(parseFloat(e.currentTarget.value))}
  >
    <ListView
      observable={props.items}
      renderItem={user => (
        <option
          selected={props.value.map(id => user.id === id)}
          value={user.id}
        >
          {user.name}
        </option>
      )}
    />
  </select>
)

export default Select
