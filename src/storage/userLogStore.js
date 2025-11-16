import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'userLogs.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { logs: [] });

db.read();
if (!db.data) {
  db.data = { logs: [] };
  db.write();
}

export function recordUserResult(userId, result) {
  if (!userId)
    return;

  db.read();
  db.data.logs.push({
    id: uuidv4(),
    userId,
    result,
    createdAt: new Date().toISOString()
  });
  db.write();
}

export function getUserLogs(userId, limit = 50) {
  db.read();
  const filtered = db.data.logs.filter(entry => entry.userId === userId);
  if (limit && limit > 0) {
    return filtered.slice(-limit);
  }
  return filtered;
}
