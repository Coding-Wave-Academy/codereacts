# Changelog

All notable changes to CodeReacts will be documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/)

---

## [1.0.0] - 2026-03-26

### Added
- Sound triggers: errors, warnings, build pass/fail, file save, debug start/stop
- 2-second cooldown per sound type (anti-spam)
- Error sounds only fire when count *increases* (not when fixing)
- `CodeReacts: Test a Sound` command — preview sounds from palette
- `CodeReacts: Toggle Mute` command
- `CodeReacts: Open Sounds Folder` command
- Settings: `cooldownMs`, `soundsDir`, `sounds` (per-key overrides)
- Cross-platform audio: `afplay` (macOS), PowerShell (Windows), `paplay`/`aplay` (Linux)
- GitHub Actions CI: lint + package on push, auto-release on version tag
