import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'sessionParticipants.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { participants: [] });

db.read();
if (!db.data) {
  db.data = { participants: [] };
  db.write();
}

export function upsertParticipant(sessionId, userId, team) {
  if (!sessionId || !userId)
    return null;

  db.read();
  let record = db.data.participants.find(p => p.sessionId === sessionId && p.userId === userId);
  if (record) {
    record.team = team ?? record.team;
    record.updatedAt = new Date().toISOString();
  } else {
    record = {
      id: uuidv4(),
      sessionId,
      userId,
      team,
      result: null,
      createdAt: new Date().toISOString()
    };
    db.data.participants.push(record);
  }
  db.write();
  return record;
}

export function updateParticipantResult(sessionId, userId, result) {
  db.read();
  const entry = db.data.participants.find(p => p.sessionId === sessionId && p.userId === userId);
  if (!entry)
    return null;

  entry.result = result;
  entry.updatedAt = new Date().toISOString();
  db.write();
  return entry;
}

export function getParticipants(sessionId) {
  db.read();
  return db.data.participants.filter(p => p.sessionId === sessionId);
}
