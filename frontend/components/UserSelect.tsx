import * as React from 'react'
import { Atom, F } from '@grammarly/focal'
import { User } from '../../common/types'

const UserSelect = (props: { users: User[]; selectedUser: Atom<number> }) => (
  <F.select
    value={props.selectedUser.view(x => x.toString())}
    onChange={e => props.selectedUser.set(parseInt(e.currentTarget.value))}
  >
    >
    {props.users.map(({ id, name }) => (
      <option key={id} value={id}>
        {name}
      </option>
    ))}
  </F.select>
)

export default UserSelect
