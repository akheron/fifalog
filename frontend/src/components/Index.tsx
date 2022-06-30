import React from 'react'
import CreateRandomMatchPair from './CreateRandomMatchPair'
import MatchList from './MatchList'
import Stats from './Stats'
import { useUsersQuery } from '../users/usersApi'

export default React.memo(function Index() {
  const { data: users, isLoading } = useUsersQuery()
  return (
    <>
      <h2>Stats</h2>
      <Stats />
      <h2>Latest matches</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : !users ? null : (
        <CreateRandomMatchPair users={users} />
      )}
      <MatchList />
    </>
  )
})
