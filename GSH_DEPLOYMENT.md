# Unity Game Server Hosting Deployment Notes

1. **Build Artifact**
   - Zip the entire `server/` directory (or produce a container image) with `package.json`, `package-lock.json`, `src/`, and `start.sh`.
   - The entry command for GSH should be `./start.sh` so dependencies are installed and the server starts on the provided `PORT`.

2. **Environment Variables**
   - `PORT` (required) – GSH injects the port to listen on.
   - Optional future vars: `MATCHMAKER_URL`, `DB_URL`.

3. **Readiness/Liveness**
   - Configure the platform to hit `GET /health`.

4. **Build & Upload**
   - `npm install && npm run dev` locally for testing.
   - For production zip: `npm install --production` before packaging to reduce startup time.

5. **Client Configuration**
   - The Unity client should use the GSH allocation API to obtain the server IP/Port and then open a websocket to `ws://<ip>:<port>`.

This document can be referenced when creating the Unity Cloud Build profile and GSH fleet configuration.
