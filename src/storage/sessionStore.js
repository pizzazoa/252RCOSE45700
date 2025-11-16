import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'sessions.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { sessions: [] });

db.read();
if (!db.data) {
  db.data = { sessions: [] };
  db.write();
}

export function upsertSessionRecord(sessionId, fields = {}) {
  if (!sessionId)
    return null;

  db.read();
  let record = db.data.sessions.find(entry => entry.id === sessionId);
  if (record) {
    Object.assign(record, fields);
    record.updatedAt = new Date().toISOString();
  } else {
    record = {
      id: sessionId,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      finishedAt: null,
      ...fields
    };
    db.data.sessions.push(record);
  }
  db.write();
  return record;
}

export function getSessionRecord(sessionId) {
  db.read();
  return db.data.sessions.find(entry => entry.id === sessionId) || null;
}
