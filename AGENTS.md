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

Tooling now uses Node.js with no package dependencies: `npm.cmd start` serves the app at http://localhost:4173, `npm.cmd run check` checks JavaScript syntax and asset references, `npm.cmd test` runs game tests, and `npm.cmd run test:browser` runs the Chrome integration checks. On Windows use `npm.cmd` if PowerShell blocks `npm.ps1`. Chrome must be installed; set `CHROME_PATH` if it is outside the default installation path. There is no build step.

When tooling is introduced, document its exact setup and commands here. Keep the application compatible with static hosting on GitHub Pages; add frameworks only when they provide a clear benefit.

The focused shop visual check is `python scripts/check-shop.py`. It requires Python with the `playwright` package installed (`python -m pip install playwright`) and uses the installed Chrome executable. It checks three desktop sizes across all themes and saves `artifacts/magic-shop-full-page.png`.

Shop uploads and JSON backup import/export use `js/shop-storage.js` and a separate IndexedDB database. Preserve existing localStorage profiles and Ann's supplied items. The shop check also covers upload/edit/remove, occupied shelves, pages, backup transfer, invalid input, failed writes, reload, and profile isolation.

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
