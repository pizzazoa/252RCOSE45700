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
    passwordHash
    // deck과 cards는 별도 store에서 관리
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
  // users.json에는 저장하지 않고 deck store에만 저장
  deckStoreSet(userId, deck);
  return user;
}

export function getUserDeck(userId) {
  const deck = deckStoreGet(userId);
  if (deck && deck.length)
    return deck;

  // 마이그레이션: 기존 users.json에 deck이 있으면 새 store로 복사
  db.read();
  const user = db.data.users.find(u => u.id === userId);
  if (user && user.deck) {
    console.log(`[Migration] Moving deck from users.json to userDecks.json for user ${userId}`);
    const userDeck = user.deck;
    deckStoreSet(userId, userDeck);
    // users.json에서 제거 (마이그레이션 완료)
    delete user.deck;
    db.write();
    return userDeck;
  }
  return null;
}

export function getUserCards(userId) {
  const cards = cardStoreGet(userId);
  if (cards && cards.length)
    return cards;

  // 마이그레이션: 기존 users.json에 cards가 있으면 새 store로 복사
  db.read();
  const user = db.data.users.find(u => u.id === userId);
  if (user && user.cards) {
    console.log(`[Migration] Moving cards from users.json to userCards.json for user ${userId}`);
    const userCards = user.cards;
    cardStoreSet(userId, userCards);
    // users.json에서 제거 (마이그레이션 완료)
    delete user.cards;
    db.write();
    return userCards;
  }

  return [];
}
