import classNames from 'classnames'
import React, {
  ChangeEvent,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from 'react'

import {
  League,
  Team,
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useLeaguesQuery,
  useUpdateLeagueMutation,
  usePatchTeamMutation,
} from '../teams/teamsApi'
import { useCheckbox, useFormState, useTextField } from '../utils/formState'
import { useBooleanState } from '../utils/state'

import * as styles from './Teams.module.css'
import { HGap, VGap } from './whitespace'

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
          <VGap size="M" />
          <Legend />
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
    async (name: string) => {
      await createTeam({ name, leagueId: league.id, disabled: false })
      createOff()
    },
    [createOff, createTeam, league.id]
  )

  return (
    <div>
      <LeagueDetails league={league} />
      <table key={league.id} className={styles.table}>
        <thead>
          <tr>
            <th className={styles.name}>Name</th>
            <th className={styles.matches}>M</th>
          </tr>
        </thead>
        <tbody>
          {league.teams.map((team) => (
            <TeamRow key={team.id} leagueId={league.id} team={team} />
          ))}
          {creating ? (
            <CreateTeam
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
        {league.name}
        <HGap />
        <button onClick={onEdit}>E</button>
      </h3>
      <p>Excluded from randomize: {league.excludeRandomAll ? 'Yes' : 'No'}</p>
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
        />
        <HGap />
        <button onClick={() => onSave(state.state)} disabled={isLoading}>
          save
        </button>
        <HGap />
        <button onClick={onCancel} disabled={isLoading}>
          cancel
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

type TeamState =
  | { state: 'view' }
  | { state: 'edit'; name: string }
  | { state: 'changeLeague'; leagueId: number }

type TeamAction =
  | { type: 'cancel' }
  | { type: 'setName'; name: string }
  | { type: 'setLeague'; leagueId: number }

function teamStateReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case 'cancel':
      return { state: 'view' }
    case 'setName':
      return { state: 'edit', name: action.name }
    case 'setLeague':
      return { state: 'changeLeague', leagueId: action.leagueId }
  }
}

function useTeamState(leagueId: number, team: Team) {
  const [patchTeam, { isLoading: isUpdating }] = usePatchTeamMutation()
  const [deleteTeam, { isLoading: isDeleting }] = useDeleteTeamMutation()
  const isLoading = isUpdating || isDeleting

  const [state, dispatch] = useReducer(teamStateReducer, { state: 'view' })

  const cancel = useCallback(() => {
    dispatch({ type: 'cancel' })
  }, [])
  const edit = useCallback(() => {
    dispatch({ type: 'setName', name: team.name })
  }, [team.name])
  const setName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setName', name: e.target.value })
  }, [])
  const save = async () => {
    switch (state.state) {
      case 'edit':
        await patchTeam({ id: team.id, name: state.name }).unwrap()
        break
      case 'changeLeague':
        await patchTeam({ id: team.id, leagueId: state.leagueId }).unwrap()
        break
    }
    cancel()
  }
  const delete_ = useCallback(() => {
    if (confirm('Really?')) {
      void deleteTeam(team.id)
    }
  }, [deleteTeam, team.id])

  const toggleDisable = useCallback(() => {
    void patchTeam({ id: team.id, disabled: !team.disabled }).unwrap()
  }, [patchTeam, team.id, team.disabled])

  const changeLeague = useCallback(() => {
    dispatch({ type: 'setLeague', leagueId })
  }, [leagueId])
  const setLeague = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'setLeague', leagueId: strToInt(e.target.value) })
  }, [])

  return {
    state,
    isLoading,
    edit,
    setName,
    delete_,
    toggleDisable,
    changeLeague,
    setLeague,
    save,
    cancel,
  }
}

const TeamRow = React.memo(function TeamView({
  leagueId,
  team,
}: {
  leagueId: number
  team: Team
}) {
  const {
    state,
    isLoading,
    edit,
    setName,
    delete_,
    toggleDisable,
    changeLeague,
    setLeague,
    save,
    cancel,
  } = useTeamState(leagueId, team)

  return (
    <tr className={classNames({ [styles.disabled]: team.disabled })}>
      <td>
        {state.state === 'edit' ? (
          <input type="text" value={state.name} onChange={setName} />
        ) : (
          team.name
        )}
      </td>
      <td>{team.matchCount}</td>
      <td>
        {state.state === 'view' ? (
          <TeamViewActions
            deletable={team.matchCount === 0}
            onEdit={edit}
            onDelete={delete_}
            onToggleDisable={toggleDisable}
            onChangeLeague={changeLeague}
            isLoading={isLoading}
          />
        ) : state.state === 'edit' ? (
          <TeamEditActions onSave={save} onCancel={cancel} />
        ) : (
          <ChangeLeague
            league={state.leagueId}
            setLeague={setLeague}
            onSave={save}
            onCancel={cancel}
            isLoading={isLoading}
          />
        )}
      </td>
    </tr>
  )
})

const TeamViewActions = React.memo(function TeamActions({
  deletable,
  onEdit,
  onDelete,
  onToggleDisable,
  onChangeLeague,
  isLoading,
}: {
  deletable: boolean
  onEdit: () => void
  onDelete: () => void
  onToggleDisable: () => void
  onChangeLeague: () => void
  isLoading: boolean
}) {
  return (
    <>
      <button onClick={onEdit} disabled={isLoading}>
        E
      </button>
      <HGap />
      {deletable ? (
        <button onClick={onDelete} disabled={isLoading}>
          R
        </button>
      ) : (
        <button onClick={onToggleDisable} disabled={isLoading}>
          D
        </button>
      )}
      <HGap />
      <button onClick={onChangeLeague} disabled={isLoading}>
        ⭢
      </button>
    </>
  )
})

const TeamEditActions = React.memo(function TeamActions({
  onSave,
  onCancel,
}: {
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <>
      <button onClick={onSave}>save</button>
      <HGap />
      <button onClick={onCancel}>cancel</button>
    </>
  )
})

const ChangeLeague = React.memo(function ChangeLeague({
  onSave,
  onCancel,
  league,
  setLeague,
  isLoading,
}: {
  league: number
  setLeague: (e: ChangeEvent<HTMLSelectElement>) => void
  onSave: () => void
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

  return (
    <>
      <div>
        <select value={league} disabled={isLoading} onChange={setLeague}>
          {leagueOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button onClick={onSave}>save</button>
        <HGap />
        <button onClick={onCancel}>cancel</button>
      </div>
    </>
  )
})

const CreateTeam = React.memo(function CreateTeam({
  onSave,
  onCancel,
  isLoading,
}: {
  onSave: (name: string) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [name, setName] = useState('')
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }, [])
  return (
    <tr>
      <td colSpan={2}>
        <input value={name} onChange={onChange} placeholder="Name" />
      </td>
      <td>
        <button onClick={() => onSave(name)} disabled={isLoading}>
          create
        </button>
        <HGap />
        <button onClick={onCancel} disabled={isLoading}>
          cancel
        </button>
      </td>
    </tr>
  )
})

const Legend = React.memo(function Legend() {
  return (
    <div>
      <div>M = Matches</div>
      <div>E = Edit</div>
      <div>R = Remove</div>
      <div>D = Disable/Enable</div>
      <div>⭢ = Move to another league</div>
    </div>
  )
})

function strToInt(str: string) {
  return parseInt(str, 10)
}
