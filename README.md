# 🎵 CodeReacts for VS Code

> Your IDE finally has feelings. Meme sound effects triggered by real coding events — because your errors deserve a *bruh*.

![Build](https://github.com/kandi/codereacts/actions/workflows/release.yml/badge.svg)
![Version](https://img.shields.io/github/v/release/kandi/codereacts)
![License](https://img.shields.io/github/license/kandi/codereacts)
![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.75.0-blue)

---

## Triggers

| Event | Sound File | Suggested Meme |
|---|---|---|
| New error | `error.mp3` | Bruh / Sad Trombone |
| New warning | `warning.mp3` | Uh Oh Stinky |
| Build / task success | `success.mp3` | GTA Mission Passed |
| Build / task failure | `error.mp3` | Windows XP Error |
| File saved | `save.mp3` | Vine Boom |
| Debug session starts | `debug_start.mp3` | Windows XP Startup |
| Debug session ends | `debug_stop.mp3` | Windows XP Shutdown |
| Test pass | `test_pass.mp3` | Among Us Task Complete |
| Test fail | `test_fail.mp3` | Noooooo |

---

## Install

### Option A — From GitHub Release (recommended)

1. Go to [Releases](https://github.com/kandi/codereacts/releases)
2. Download the latest `.vsix` file
3. Run:
```bash
code --install-extension meme-sounds-X.X.X.vsix
```

### Option B — From source

```bash
git clone https://github.com/kandi/codereacts.git
cd codereacts
npm install
npm run package
code --install-extension meme-sounds-*.vsix
```

---

## Setup: Adding Sounds

The extension ships **without** sound files (licensing). You bring your own:

1. Find sounds at [myinstants.com](https://www.myinstants.com) or [freesound.org](https://freesound.org)
2. Rename to match the filenames in the table above
3. Open **Command Palette** → `CodeReacts: Open Sounds Folder`
4. Drop your files there
5. Done — no restart needed

---

## Commands

| Command | Description |
|---|---|
| `CodeReacts: Test a Sound` | Preview any sound without triggering an event |
| `CodeReacts: Toggle Mute` | Silence everything temporarily |
| `CodeReacts: Open Sounds Folder` | Opens the sounds directory in your file manager |

---

## Settings

| Setting | Default | Description |
|---|---|---|
| `memeSounds.cooldownMs` | `2000` | Min ms between the same sound repeating |
| `memeSounds.soundsDir` | `""` | Custom sounds folder path |
| `memeSounds.sounds` | `{}` | Override filenames per key |

**Example settings.json:**
```json
{
  "memeSounds.cooldownMs": 3000,
  "memeSounds.sounds": {
    "error": "vine_boom.mp3",
    "success": "victory_royale.mp3"
  }
}
```

---

## Anti-Spam Design

- **Cooldown** — same sound won't play twice within `cooldownMs` (default 2s)
- **Delta-based errors** — error sound only fires when error count *increases*, not when you're fixing them
- **Mute toggle** — one command to silence everything

---

## Platform Support

| Platform | Audio Command |
|---|---|
| macOS | `afplay` (built-in) |
| Windows | PowerShell `Media.SoundPlayer` |
| Linux | `paplay` (PulseAudio) or `aplay` (ALSA) |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). PRs for new triggers, sounds, or platform fixes are very welcome.

---

## License

[MIT](./LICENSE) © Kandi
