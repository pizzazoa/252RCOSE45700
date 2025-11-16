import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'userCards.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { cards: [] });

db.read();
if (!db.data) {
  db.data = { cards: [] };
  db.write();
}

function getCardsEntry(userId) {
  db.read();
  return db.data.cards.find(entry => entry.userId === userId) || null;
}

export function getUserCards(userId) {
  const entry = getCardsEntry(userId);
  return entry ? entry.cards : [];
}

export function setUserCards(userId, cards) {
  db.read();
  let entry = getCardsEntry(userId);
  const normalized = Array.isArray(cards) ? [...cards] : [];
  if (entry) {
    entry.cards = normalized;
  } else {
    db.data.cards.push({ userId, cards: normalized });
  }
  db.write();
}

export function ensureUserCards(userId, defaultCards) {
  const existing = getCardsEntry(userId);
  if (!existing) {
    setUserCards(userId, defaultCards);
  }
}
