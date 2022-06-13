import * as dotenv from 'dotenv'
dotenv.config()

import * as pg from 'pg'
import { migrate, loadMigrationFiles } from 'postgres-migrations'
import config from './config'

const forceSslOptions = {
  rejectUnauthorized: false,
}

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseForceSsl ? forceSslOptions : undefined,
})

const migrationsDir = './migrations'

async function main() {
  let status: boolean
  if (process.argv[2] === 'list') {
    await listMigrations()
    status = true
  } else if (process.argv[2] === 'fake') {
    const id = Number(process.argv[3])
    if (isNaN(id)) {
      console.log(`Invalid migration id: ${process.argv[3]}`)
      status = false
    } else {
      await fakeMigration(id)
      status = true
    }
  } else {
    status = await applyMigrations()
  }
  process.exit(status ? 0 : 1)
}

async function listMigrations() {
  for (const migration of await loadMigrationFiles(migrationsDir)) {
    console.log(`${migration.id} ${migration.name} ${migration.hash}`)
  }
}

async function fakeMigration(id: number) {
  const migrations = await loadMigrationFiles(migrationsDir)
  const faked = migrations.find(m => m.id === id)
  if (!faked) {
    console.log(`No migration with id ${id}`)
    return
  }
  await withConnection(undefined, client => {
    console.log(`Execute this query to fake migration ${id}:`)
    console.log(
      `INSERT INTO migrations (id, name, hash, executed_at) VALUES (${
        faked.id
      }, ${client.escapeLiteral(faked.name)}, ${client.escapeLiteral(
        faked.hash
      )}, now())`
    )
  })
}

async function applyMigrations() {
  return withConnection(false, async client => {
    try {
      await migrate({ client }, migrationsDir, {
        logger: line => console.log(line),
      })
    } catch (e) {
      console.error((e as Error).message)
      return false
    }
    return true
  })
}

async function withConnection<A>(
  onError: A,
  fn: (client: pg.PoolClient) => A | Promise<A>
): Promise<A> {
  let client: pg.PoolClient
  try {
    client = await pool.connect()
  } catch (err) {
    console.error(err)
    return onError
  }
  try {
    return await fn(client)
  } catch (err) {
    console.error(err)
    return onError
  } finally {
    client.release()
    pool.end()
  }
}

main()
