import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'userDecks.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { decks: [] });

db.read();
if (!db.data) {
  db.data = { decks: [] };
  db.write();
}

function getDeckEntry(userId) {
  db.read();
  return db.data.decks.find(entry => entry.userId === userId) || null;
}

export function getUserDeck(userId) {
  const entry = getDeckEntry(userId);
  return entry ? entry.deck : null;
}

export function setUserDeck(userId, deck) {
  db.read();
  let entry = getDeckEntry(userId);
  if (entry) {
    entry.deck = Array.isArray(deck) ? [...deck] : [];
  } else {
    db.data.decks.push({ userId, deck: Array.isArray(deck) ? [...deck] : [] });
  }
  db.write();
}

export function ensureUserDeck(userId, defaultDeck) {
  const existing = getDeckEntry(userId);
  if (!existing) {
    setUserDeck(userId, defaultDeck);
  }
}
