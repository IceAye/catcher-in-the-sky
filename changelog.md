# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
