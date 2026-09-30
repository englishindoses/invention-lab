# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains only `game-plan-chatgpt.md`, the specification for **The Invention Lab**, a teacher-controlled browser speaking game for ages 8–12. Read it before changing scope or gameplay.

The planned stack is HTML, CSS, vanilla JavaScript, Firebase, and GitHub Pages. Follow the proposed layout when implementing:

- `index.html`: application entry point.
- `css/`: base styles, lab layout, and visual themes.
- `js/`: separate modules for gameplay, word lists, storage, achievements, sound, themes, and authentication.
- `assets/images/`, `assets/sounds/`, `assets/icons/`: static resources.

Keep word lists separate from game logic and storage separate from gameplay. These directories do not exist yet.

## Build, Test, and Development Commands

No build system, package manifest, development server, or automated test commands are configured. Do not assume `npm start`, `npm test`, or `npm run build` exists.

When tooling is introduced, document its exact setup and commands here. Keep the application compatible with static hosting on GitHub Pages; add frameworks only when they provide a clear benefit.

## Coding Style & Naming Conventions

For new code, use two-space indentation, descriptive `camelCase` JavaScript identifiers, and lowercase filenames such as `game.js` and `themes.css`. Keep modules focused on one responsibility. No formatter or linter is configured yet.

Share game logic across all three themes. Store tunable values, including the starting coin balance, in configuration rather than scattering literals throughout the code.

## Testing Guidelines

No test framework or coverage threshold exists yet. Verify implemented behavior in desktop Chrome, including the planned 1366×768 layout.

Check one-coin lever costs, independent rerolls, nonnegative balances, required invention names, all sale outcomes, round resets, and duplicate-click protection. As persistence is added, verify history, statistics, achievements, and preferences survive reloads.

## Commit & Pull Request Guidelines

No Git metadata or commit history is available. Use concise, imperative commit subjects, for example `Add independent word levers`. Keep changes focused.

PRs should describe behavior changes, reference the relevant game-plan phase or issue, report validation, and include screenshots for visual changes.

## Implementation Order & Security

Build gameplay and local data first, then Firestore storage; add authentication last. Keep early phases usable without login. Never store plaintext passwords or commit private credentials. Preserve teacher-led conversation: built-in speaking prompts and AI images are outside first-version scope.
