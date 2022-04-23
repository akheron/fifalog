// Generated by sqltyper from deleteMatch.sql.
// Do not edit directly. Instead, edit deleteMatch.sql and re-run sqltyper.

import { ClientBase, Pool } from 'pg'

export async function deleteMatch(
  client: ClientBase | Pool,
  params: { matchId: number }
): Promise<number> {
  const result = await client.query(
    `\
DELETE FROM match
WHERE id = $1
AND finished_type IS NULL
`,
    [params.matchId]
  )
  return result.rowCount
}
