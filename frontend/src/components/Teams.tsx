import React, { useCallback, useMemo } from 'react'

import {
  League,
  Team,
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useLeaguesQuery,
  useUpdateLeagueMutation,
  useUpdateTeamMutation,
} from '../teams/teamsApi'
import {
  useCheckbox,
  useFormState,
  useSelect,
  useTextField,
} from '../utils/formState'
import { useBooleanState } from '../utils/state'

export default React.memo(function Teams() {
  const { data: leagues, isLoading } = useLeaguesQuery()
  return (
    <div>
      <h2>Teams</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : !leagues ? null : (
        <div>
          {leagues.map((league) => (
            <LeagueTable key={league.id} league={league} />
          ))}
        </div>
      )}
    </div>
  )
})

const LeagueTable = React.memo(function League({ league }: { league: League }) {
  const [createTeam, { isLoading }] = useCreateTeamMutation()
  const {
    value: creating,
    on: createOn,
    off: createOff,
  } = useBooleanState(false)

  const save = useCallback(
    async (data: TeamEditState) => {
      await createTeam(data)
      createOff()
    },
    [createOff, createTeam]
  )

  return (
    <div>
      <LeagueDetails league={league} />
      <table key={league.id}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Disabled?</th>
            <th>Matches</th>
          </tr>
        </thead>
        <tbody>
          {league.teams.map((team) => (
            <TeamRow key={team.id} leagueId={league.id} team={team} />
          ))}
          {creating ? (
            <TeamEdit
              leagueId={league.id}
              onSave={save}
              onCancel={createOff}
              isLoading={isLoading}
            />
          ) : (
            <tr>
              <td>
                <button onClick={createOn}>+</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
})

const LeagueDetails = React.memo(function LeagueDetails({
  league,
}: {
  league: League
}) {
  const { value: editing, on, off } = useBooleanState(false)
  const [updateLeague, { isLoading }] = useUpdateLeagueMutation()
  const save = useCallback(
    async (value: LeagueEditState) => {
      await updateLeague({ id: league.id, ...value })
      off()
    },
    [league.id, off, updateLeague]
  )

  return editing ? (
    <LeagueDetailsEdit
      league={league}
      onSave={save}
      onCancel={off}
      isLoading={isLoading}
    />
  ) : (
    <LeagueDetailsView league={league} onEdit={on} />
  )
})

const LeagueDetailsView = React.memo(function LeagueDetailsView({
  league,
  onEdit,
}: {
  league: League
  onEdit: () => void
}) {
  return (
    <>
      <h3>
        {league.name} <button onClick={onEdit}>E</button>
      </h3>
      <p>
        Excluded from randomize:{' '}
        {league.excludeRandomAll ? 'Yes' : 'No'}
      </p>
    </>
  )
})

interface LeagueEditState {
  name: string
  excludeRandomAll: boolean
}

const LeagueDetailsEdit = React.memo(function LeagueDetailsEdit({
  league,
  onSave,
  onCancel,
  isLoading,
}: {
  league: League
  onSave: (data: LeagueEditState) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const state = useFormState<LeagueEditState>({
    name: league.name,
    excludeRandomAll: league.excludeRandomAll,
  })
  const [name, setName] = useTextField(state, 'name')
  const [excludeRandomAll, setExcludeRandomAll] = useCheckbox(
    state,
    'excludeRandomAll'
  )

  return (
    <>
      <h3>
        <input
          type="text"
          value={name}
          onChange={setName}
          disabled={isLoading}
        />{' '}
        <button onClick={() => onSave(state.state)} disabled={isLoading}>
          OK
        </button>{' '}
        <button onClick={onCancel} disabled={isLoading}>
          X
        </button>
      </h3>
      <p>
        Excluded from randomize:{' '}
        <input
          type="checkbox"
          checked={excludeRandomAll}
          onChange={setExcludeRandomAll}
          disabled={isLoading}
        />
      </p>
    </>
  )
})

const TeamRow = React.memo(function Team({
  leagueId,
  team,
}: {
  leagueId: number
  team: Team
}) {
  const [updateTeam, { isLoading }] = useUpdateTeamMutation()

  const { value: editing, on, off } = useBooleanState(false)
  const save = useCallback(
    async (update: TeamEditState) => {
      try {
        await updateTeam({
          id: team.id,
          ...update,
        }).unwrap()
        off()
      } catch (_err) {
        // TODO: show error state
      }
    },
    [off, team.id, updateTeam]
  )

  return editing ? (
    <TeamEdit
      leagueId={leagueId}
      team={team}
      onSave={save}
      onCancel={off}
      isLoading={isLoading}
    />
  ) : (
    <TeamView team={team} onEdit={on} />
  )
})

const TeamView = React.memo(function TeamView({
  team,
  onEdit,
}: {
  team: Team
  onEdit: () => void
}) {
  const [deleteTeam, { isLoading }] = useDeleteTeamMutation()
  const onDelete = useCallback(() => {
    if (confirm('Really?')) {
      void deleteTeam(team.id)
    }
  }, [deleteTeam, team.id])
  return (
    <tr>
      <td>{team.name}</td>
      <td>{team.disabled ? 'Yes' : 'No'}</td>
      <td>{team.matchCount}</td>
      <td>
        <button onClick={onEdit} disabled={isLoading}>
          E
        </button>{' '}
        {team.matchCount === 0 ? (
          <button onClick={onDelete} disabled={isLoading}>
            R
          </button>
        ) : null}
      </td>
    </tr>
  )
})

interface TeamEditState {
  name: string
  leagueId: number
  disabled: boolean
}

const TeamEdit = React.memo(function TeamEdit({
  leagueId,
  team,
  onSave,
  onCancel,
  isLoading,
}: {
  leagueId: number
  team?: Team | undefined
  onSave: (update: TeamEditState) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const { data: leagues } = useLeaguesQuery()
  const leagueOptions = useMemo(
    () =>
      leagues
        ? leagues.map((league) => ({
            label: league.name,
            value: league.id,
          }))
        : [],
    [leagues]
  )
  const state = useFormState<TeamEditState>({
    name: team ? team.name : '',
    leagueId,
    disabled: team ? team.disabled : false,
  })
  const [name, setName] = useTextField(state, 'name')
  const [disabled, setDisabled] = useCheckbox(state, 'disabled')
  const [leagueId_, setLeagueId] = useSelect(state, 'leagueId', strToInt)
  return (
    <tr>
      <td>
        <input
          value={name}
          onChange={setName}
          placeholder="Name"
          disabled={isLoading}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={disabled}
          onChange={setDisabled}
          disabled={isLoading}
        />
      </td>
      <td>
        <select value={leagueId_} disabled={isLoading} onChange={setLeagueId}>
          {leagueOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </td>
      <td>
        <button
          onClick={() => onSave({ name, leagueId: leagueId_, disabled })}
          disabled={isLoading}
        >
          OK
        </button>{' '}
        <button onClick={onCancel} disabled={isLoading}>
          X
        </button>
      </td>
    </tr>
  )
})

function strToInt(str: string) {
  return parseInt(str, 10)
}
