import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'cards.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { cards: [] });

db.read();
if (!db.data) {
  db.data = { cards: [] };
  db.write();
}

export function getAllCards() {
  db.read();
  return db.data.cards;
}

export function upsertCard(card) {
  if (!card || !card.id)
    return null;

  db.read();
  const existing = db.data.cards.find(entry => entry.id === card.id);
  if (existing) {
    Object.assign(existing, card);
  } else {
    db.data.cards.push(card);
  }
  db.write();
  return card;
}

export function getCard(cardId) {
  db.read();
  return db.data.cards.find(entry => entry.id === cardId) || null;
}
