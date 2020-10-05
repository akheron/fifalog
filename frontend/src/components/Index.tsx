import { Atom, atom, h } from 'harmaja'
import { definedOr } from '../atom-utils'

import { State } from '../state'
import CreateRandomMatchPair from './CreateRandomMatchPair'
import MatchList from './MatchList'
import Stats from './Stats'

export default (props: { state: Atom<State.LoggedInState> }) => (
  <div>
    {definedOr(
      props.state,
      state => (
        <div>
          <h2>Stats</h2>
          {state.view('stats').map(stats => (
            <Stats stats={stats} />
          ))}
          <h2>Latest matches</h2>
          <CreateRandomMatchPair
            users={state.view('users')}
            matches={state.view('matches')}
          />
          <MatchList rows={state.view('matches')} stats={state.view('stats')} />
        </div>
      ),

      () => (
        <span>Loading...</span>
      )
    )}
  </div>
)
