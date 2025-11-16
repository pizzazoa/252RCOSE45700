import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'sessionCards.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { cards: [] });

db.read();
if (!db.data) {
  db.data = { cards: [] };
  db.write();
}

export function replacePlayerCards(sessionId, userId, cards) {
  if (!sessionId || !userId)
    return;

  db.read();
  db.data.cards = db.data.cards.filter(entry => !(entry.sessionId === sessionId && entry.userId === userId));
  const timestamp = new Date().toISOString();
  const newEntries = (cards || []).map(({ cardId, location, position }) => ({
    id: uuidv4(),
    sessionId,
    userId,
    cardId,
    location,
    position,
    createdAt: timestamp
  }));
  db.data.cards.push(...newEntries);
  db.write();
}

export function getSessionCards(sessionId, userId = null) {
  db.read();
  return db.data.cards.filter(entry => entry.sessionId === sessionId && (!userId || entry.userId === userId));
}
