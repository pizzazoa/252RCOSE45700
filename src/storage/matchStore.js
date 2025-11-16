import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'matches.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { matches: [] });

db.read();
if (!db.data) {
  db.data = { matches: [] };
  db.write();
}

export function recordMatch(result) {
  db.read();
  db.data.matches.push({ ...result, finishedAt: new Date().toISOString() });
  db.write();
}

export function getMatches(limit = 50) {
  db.read();
  return db.data.matches.slice(-limit);
}
