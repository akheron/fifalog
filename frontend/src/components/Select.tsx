import { Property } from 'baconjs'
import { Atom, ListView, h } from 'harmaja'

export type Item = {
  id: number
  name: string
}

export type Props = {
  items: Property<Item[]>
  value: Atom<number>
}

export default ({ items, value }: Props) => (
  <select onChange={e => value.set(parseFloat(e.currentTarget.value))}>
    <ListView
      observable={items}
      renderItem={user => (
        <option selected={value.map(id => user.id === id)} value={user.id}>
          {user.name}
        </option>
      )}
    />
  </select>
)
