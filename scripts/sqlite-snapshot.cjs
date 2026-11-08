// Usage: node sqlite-snapshot.cjs <source.sqlite> [destination.sqlite]
// Takes a consistent copy of a SQLite database (WAL-safe, via the backup API when a destination is given),
// checks its integrity and prints a one-line JSON summary. Runs from the project root, locally or on the
// server, so `better-sqlite3` resolves from that project's node_modules.
const { createRequire } = require('node:module')
const { statSync } = require('node:fs')
const Database = createRequire(process.cwd() + '/')('better-sqlite3')

async function main() {
  const [source, destination] = process.argv.slice(2)
  if (!source) throw new Error('missing source path')

  let target = source
  if (destination) {
    const live = new Database(source, { fileMustExist: true })
    try { await live.backup(destination) } finally { live.close() }
    // Leave one self-contained file: no -wal/-shm sidecars next to the copy.
    const copy = new Database(destination, { fileMustExist: true })
    try { copy.pragma('journal_mode = DELETE') } finally { copy.close() }
    target = destination
  }

  const db = new Database(target, { fileMustExist: true, readonly: true })
  try {
    const count = sql => { try { return db.prepare(sql).get().n } catch { return 0 } }
    const collections = {}
    try {
      for (const row of db.prepare('SELECT collection, COUNT(*) AS n FROM collection_items GROUP BY collection').all()) {
        collections[row.collection] = row.n
      }
    } catch { /* table missing in a fresh database */ }
    process.stdout.write(JSON.stringify({
      path: target,
      bytes: statSync(target).size,
      integrity: db.pragma('integrity_check', { simple: true }),
      collections,
      visits: count('SELECT COUNT(*) AS n FROM visits'),
      uploads: count('SELECT COUNT(*) AS n FROM uploads'),
    }) + '\n')
  } finally {
    db.close()
  }
}

main().catch(error => { console.error(error.message); process.exit(1) })
