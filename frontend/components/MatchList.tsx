import * as React from 'react'
import { SavedMatch } from '../../common/types'
import FinishedMatch from './FinishedMatch'
import FutureMatch from './FutureMatch'

const MatchList = (props: { matches: SavedMatch[] }) => (
  <div>
    {props.matches.map(match =>
      match.result ? (
        <FinishedMatch key={match.id} match={match} result={match.result} />
      ) : (
        <FutureMatch key={match.id} match={match} />
      )
    )}
  </div>
)

export default MatchList
