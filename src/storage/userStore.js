import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { getUserDeck as deckStoreGet, setUserDeck as deckStoreSet } from './userDeckStore.js';
import { getUserCards as cardStoreGet, setUserCards as cardStoreSet } from './userCardStore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '..', '..', 'data', 'users.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { users: [] });

db.read();
if (!db.data) {
  db.data = { users: [] };
  db.write();
}

export function findUserByUsername(username) {
  db.read();
  return db.data.users.find(u => u.username === username);
}

export function findUserById(userId) {
  db.read();
  return db.data.users.find(u => u.id === userId);
}

export function createUser(username, passwordHash, defaultDeck, defaultCards) {
  db.read();
  const newUser = {
    id: uuidv4(),
    username,
    passwordHash,
    deck: defaultDeck,
    cards: defaultCards
  };
  db.data.users.push(newUser);
  db.write();
  deckStoreSet(newUser.id, defaultDeck);
  cardStoreSet(newUser.id, defaultCards);
  return newUser;
}

export function updateUserDeck(userId, deck) {
  db.read();
  const user = db.data.users.find(u => u.id === userId);
  if (!user) return null;
  user.deck = deck;
  db.write();
  deckStoreSet(userId, deck);
  return user;
}

export function getUserDeck(userId) {
  const deck = deckStoreGet(userId);
  if (deck && deck.length)
    return deck;

  db.read();
  const user = db.data.users.find(u => u.id === userId);
  if (user && user.deck) {
    deckStoreSet(userId, user.deck);
    return user.deck;
  }
  return null;
}

export function getUserCards(userId) {
  const cards = cardStoreGet(userId);
  if (cards && cards.length)
    return cards;

  db.read();
  const user = db.data.users.find(u => u.id === userId);
  if (user && user.cards) {
    cardStoreSet(userId, user.cards);
    return user.cards;
  }

  return [];
}
