// Generated by sqltyper 1.0.0 from users.sql.
// Do not edit directly. Instead, edit users.sql and re-run sqltyper.

import { ClientBase, Pool } from 'pg'

export async function users(
  client: ClientBase | Pool
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