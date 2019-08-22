import * as React from 'react'
import { Atom, F } from '@grammarly/focal'
import { Team } from '../types'

export default (props: { teams: Atom<[Team, Team] | null> }) => (
  <F.div>
    {props.teams.view(teams =>
      teams ? `Teams: ${teams[0]} vs ${teams[1]}` : ''
    )}
  </F.div>
)
