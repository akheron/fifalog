import * as React from 'react'
import { Atom } from '@grammarly/focal'
import { SavedMatch, User } from '../../common/types'
import { CreateRandomMatchPairState } from '../state'
import { createRandomMatchPair } from '../mutations'
import RandomizeButton from './RandomizeButton'
import UserSelect from './UserSelect'

const CreateRandomMatchPair = (props: {
  users: User[]
  latestMatches: Atom<SavedMatch[] | null>
  state: Atom<CreateRandomMatchPairState>
}) => {
  return (
    <div>
      <UserSelect
        users={props.users}
        selectedUser={props.state.lens('userIds', 0)}
      />{' '}
      <UserSelect
        users={props.users}
        selectedUser={props.state.lens('userIds', 1)}
      />{' '}
      <RandomizeButton
        onClick={() =>
          createRandomMatchPair(props.latestMatches, props.state.get().userIds)
        }
        title="Create random match pair"
      />
    </div>
  )
}

export default CreateRandomMatchPair
