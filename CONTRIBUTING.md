# Contributing to CodeReacts

Contributions are welcome! Whether it's a new sound trigger, a bug fix, or a better default sound suggestion — open a PR.

---

## Getting Started

```bash
git clone https://github.com/kandi/codereacts.git
cd codereacts
npm install
```

Open the folder in VS Code, then press `F5` to launch an **Extension Development Host** and test live.

---

## Adding a New Sound Trigger

1. Add the key and default filename to `DEFAULT_SOUNDS` in `src/extension.js`
2. Register a new listener and call `playSound('yourKey')`
3. Add the entry to the sounds table in `README.md`
4. Update `CHANGELOG.md`
5. Open a PR

---

## Submitting a PR

- Keep commits focused (one change per commit)
- Run `npm run lint` before pushing
- Describe *what* and *why* in your PR description

---

## Suggesting Default Sounds

Open an issue with the title `[Sound Suggestion]` and include:
- The trigger event
- The meme sound name and a link to a free source
- Why it fits

---

## Code of Conduct

Be cool. This is a fun project.
