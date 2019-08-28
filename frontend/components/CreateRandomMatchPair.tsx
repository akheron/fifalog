import * as React from 'react'
import { F, Atom, Option } from '@grammarly/focal'
import { Match, User } from '../../common/types'
import { CreateRandomMatchPairState } from '../state'
import { requireAtom } from '../utils'
import { createRandomMatchPair } from '../mutations'
import RandomizeButton from './RandomizeButton'
import UserSelect from './UserSelect'

const CreateRandomMatchPair = (props: {
  users: User[]
  latestMatches: Atom<Match[]>
  state: Atom<Option<CreateRandomMatchPairState>>
}) => (
  <F.Fragment>
    {requireAtom(props.state, null, state => (
      <F.div>
        {state.view(({ user1, user2 }) => (
          <>
            <UserSelect
              users={props.users}
              selectedUser={state.lens('user1')}
            />
            {' vs. '}
            <UserSelect
              users={props.users}
              selectedUser={state.lens('user2')}
            />{' '}
            <RandomizeButton
              disabled={user1 === user2}
              onClick={() =>
                createRandomMatchPair(props.latestMatches, [user1, user2])
              }
              title="Create random match pair"
            />
          </>
        ))}
      </F.div>
    ))}
  </F.Fragment>
)

export default CreateRandomMatchPair
