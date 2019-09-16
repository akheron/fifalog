import { ClientBase } from 'pg'

export async function deleteMatch(
  client: ClientBase,
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
