# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] – 2025-09-11

### ✅ Added
- Unified notification system across View, Controller, and modelRemoteProxy:
    - Introduced `showNotification(message)` for consistent system messaging with optional sound.
    - Implemented `initModelEventHandlers()` to route model events into the notification pipeline.
    - Adopted event emitter pattern for handling server-driven events.
- Migrated server architecture to Express:
    - Static file serving for `public` and `src` directories.
    - Dynamic protocol and host resolution via updated `server.js` and `ModelRemoteProxy.js`.
    - Environment-based configuration using `PORT` variable.

### 🔧 Changed
- Refactored constants:
    - Split game and server constants into dedicated modules (`gameSetup.js`, `serverEvents.js`).
    - Replaced magic strings with imported constants across client and server logic.
    - Removed legacy `alert()` calls in favor of centralized notification handling.
- Updated dependencies and server logic to reflect Express integration.

### 💬 Notes
This is the first stable release with a unified notification system and Express-powered backend — **v1.0.0** is officially alive and kicking! 🎉


## [0.1.0] - 2025-09-04
### Added
- Independent multiplayer architecture with automatic player pairing.
- Role assignment (`catcherOne` / `catcherTwo`) sent from server to proxy.
- Event-driven message handling in proxy (`#handleServerEvent`) for role and readiness tracking.
- Private proxy fields `#secondPlayerReady` and `#role` for internal multiplayer state.
- Role-based filtering of `moveCatcher(catcherId, direction)` commands.

### Changed
- Server connection logic refactored to manage isolated two-player games via `pairs` array.
- Game state updates and commands are now scoped to a specific player pair.

### Notes
- Temporary `alert()` messages added for development testing of multiplayer events.
- This is the first functional milestone for independent multiplayer — **v0.1.0**.
