import { ClientBase } from 'pg'

export async function users(
  client: ClientBase
): Promise<Array<{ id: number; name: string }>> {
  const result = await client.query(`\
SELECT
  id,
  name
FROM "user"
ORDER BY name
`)
  return result.rows
}
