import * as React from 'react'
import { Atom, F, bind } from '@grammarly/focal'
import { User } from '../../common/types'

const UserSelect = (props: { users: User[]; selectedUser: Atom<number> }) => (
  <F.select {...bind({ value: props.selectedUser })}>
    {props.users.map(({ id, name }) => (
      <option key={id} value={id}>
        {name}
      </option>
    ))}
  </F.select>
)

export default UserSelect
