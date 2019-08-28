import * as React from 'react'
import { Atom, F } from '@grammarly/focal'
import { Match } from '../../common/types'
import { deleteMatch } from '../mutations'
import MatchRow from './MatchRow'

const MatchList = (props: { matches: Atom<Match[]> }) => (
  <F.div>
    {props.matches.view(
      matches =>
        matches &&
        matches.map(match => (
          <MatchRow
            key={match.id}
            match={match}
            onRemove={() => deleteMatch(props.matches, match.id)}
          />
        ))
    )}
  </F.div>
)

export default MatchList
