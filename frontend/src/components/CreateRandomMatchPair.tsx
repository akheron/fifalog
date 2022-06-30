import React, { useCallback } from 'react'

import { useCreateRandomMatchPairMutation } from '../matches/matchesApi'
import { User } from '../users/usersApi'
import { useFormField, useFormState } from '../utils/formState'

import Select from './Select'

export interface State {
  user1: number
  user2: number
}

export interface Props {
  users: User[]
}

export default React.memo(function CreateRandomMatchPair({ users }: Props) {
  const [createRandomMatchPair, { isLoading, isError }] =
    useCreateRandomMatchPairMutation()

  const formState = useFormState<State>({
    user1: users[0].id,
    user2: users[1].id,
  })
  const [user1, setUser1] = useFormField(formState, 'user1')
  const [user2, setUser2] = useFormField(formState, 'user2')

  const randomize = useCallback(async () => {
    await createRandomMatchPair({ ...formState.state, respectLeagues: false })
  }, [createRandomMatchPair, formState.state])
  const randomizeInLeagues = useCallback(async () => {
    await createRandomMatchPair({ ...formState.state, respectLeagues: true })
  }, [createRandomMatchPair, formState.state])

  return (
    <>
      <Select options={users} value={user1} onChange={setUser1} />
      {' vs. '}
      <Select options={users} value={user2} onChange={setUser2} />{' '}
      <button
        type="button"
        disabled={isLoading || user1 === user2}
        onClick={randomize}
      >
        Randomize
      </button>{' '}
      <button
        type="button"
        disabled={isLoading || user1 === user2}
        onClick={randomizeInLeagues}
      >
        Randomize in leagues
      </button>{' '}
      {isError ? 'Could not create match' : null}
    </>
  )
})
