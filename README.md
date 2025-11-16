# Haegin Multiplayer Dedicated Server

This folder contains a lightweight Node.js websocket/HTTP server meant to run as a Unity Game Server Hosting (GSH) dedicated instance. It exposes a `/health` endpoint for readiness probes and a websocket interface for turn/command relays between two players.

## Requirements

- Node.js 18+
- The `.env` file is optional. When running on Unity GSH, the orchestration layer injects `PORT`.

## Commands

```bash
npm install
npm run dev   # local hot reload
npm start     # production mode
```

Match results are persisted to `data/matches.json` using [lowdb](https://github.com/typicode/lowdb). You can query the last results via `GET /matches`.

## Message Flow (WebSocket)

All messages are JSON encoded:

| Type              | Description |
|-------------------|-------------|
| `welcome`         | Sent by server immediately after connection with a generated `clientId`. |
| `create-session`  | Client request: server responds with `session-created`. |
| `join-session`    | Client request with `sessionId`. Success => `session-joined`, then both players receive `match-ready`. |
| `player-command`  | Client request to broadcast an in-game action (`command` payload is opaque to the server). |
| `command`         | Server broadcast to every player in the session, includes `from` clientId. |
| `player-left`     | Broadcast when a player disconnects. |
| `error`           | Failure reasons. |

### Example

```json
{"type":"create-session"}
{"type":"session-created","sessionId":"a1b2c3d4"}
{"type":"player-command","sessionId":"a1b2c3d4","command":{"action":"play-card","cardId":"Slash"}}
```

## Unity Integration Notes

1. During scene load, connect via WebSocket (e.g., `ws://127.0.0.1:8080`).
2. On `welcome`, persist `clientId`. Use it to correlate `command.from`.
3. Before the match, host sends `create-session`; the joining client sends `join-session`.
4. When `match-ready` arrives, both sides know the session is full and can start the turn order.
5. Wrap the local `TurnManager` so that the active player sends `player-command` and the remote player executes the command when a `command` message arrives.

## Health Probe

```
GET /health -> { "status": "ok", "uptime": 12.34 }
```

This endpoint can be used by Unity GSH (or any orchestrator) to determine readiness/liveness.
