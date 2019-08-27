import * as React from 'react'
import { Atom, F } from '@grammarly/focal'
import { SavedMatch } from '../../common/types'
import { deleteMatch } from '../mutations'
import Match from './Match'

const MatchList = (props: { matches: Atom<SavedMatch[] | null> }) => (
  <F.div>
    {props.matches.view(
      matches =>
        matches &&
        matches.map(match => (
          <Match
            key={match.id}
            match={match}
            onRemove={() => deleteMatch(props.matches, match.id)}
          />
        ))
    )}
  </F.div>
)

export default MatchList
