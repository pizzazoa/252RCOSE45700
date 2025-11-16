import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'sessionTurns.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { turns: [] });

db.read();
if (!db.data) {
  db.data = { turns: [] };
  db.write();
}

export function upsertTurnState(sessionId, turnNumber, activePlayerClientId, phase) {
  db.read();
  let entry = db.data.turns.find(record => record.sessionId === sessionId);
  if (entry) {
    entry.turnNumber = turnNumber;
    entry.activePlayerClientId = activePlayerClientId;
    entry.phase = phase;
    entry.updatedAt = new Date().toISOString();
  } else {
    entry = {
      sessionId,
      turnNumber,
      activePlayerClientId,
      phase,
      createdAt: new Date().toISOString()
    };
    db.data.turns.push(entry);
  }
  db.write();
  return entry;
}

export function getTurnState(sessionId) {
  db.read();
  return db.data.turns.find(record => record.sessionId === sessionId) || null;
}
