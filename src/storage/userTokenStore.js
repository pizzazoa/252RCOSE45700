import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'userTokens.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { tokens: [] });

db.read();
if (!db.data) {
  db.data = { tokens: [] };
  db.write();
}

export function storeToken(token, userId, expiresAt = null) {
  if (!token || !userId)
    return;

  db.read();
  const existing = db.data.tokens.find(entry => entry.token === token);
  if (existing) {
    existing.userId = userId;
    existing.expiresAt = expiresAt;
    existing.updatedAt = new Date().toISOString();
  } else {
    db.data.tokens.push({
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt
    });
  }
  db.write();
}

export function getTokenRecord(token) {
  db.read();
  return db.data.tokens.find(entry => entry.token === token) || null;
}

export function removeToken(token) {
  db.read();
  const before = db.data.tokens.length;
  db.data.tokens = db.data.tokens.filter(entry => entry.token !== token);
  if (db.data.tokens.length !== before) {
    db.write();
  }
}
