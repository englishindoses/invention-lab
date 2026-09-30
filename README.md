# The Invention Lab

Hosted game: https://englishindoses.github.io/invention-lab/

GitHub Pages serves the static app from `main` at the repository root, with no build step. Publish updates by committing and pushing to `main`. Localhost and the hosted site have separate browser saves; existing local notebooks do not transfer automatically.

A teacher-controlled speaking game with two word levers, a coin economy, invention collection, ten achievements, lifetime statistics, three visual themes, and optional sound effects. Everything runs locally; no external services or dependencies are needed.

## Open the game

Recommended: open PowerShell in this folder and run:

```powershell
npm start
```

Open **http://127.0.0.1:4173** in Chrome. Leave the terminal running; press **Ctrl+C** to stop it. Node.js must be installed. No `npm install` or build step is needed.

You can also double-click `index.html` to play directly. Browser storage behavior for local files varies; the local server is recommended for consistent saving. Always use the same browser and address: file mode, localhost, and 127.0.0.1 have separate saves.

## Play and save

On the homepage, fill in **Register Inventor** with a name and password. Then enter those details on the **Lab Access** pad. Matching details show green **Access Granted** and open the lab; an unknown name or incorrect password shows red **Access Denied**. Names are case-insensitive; passwords are case-sensitive. The access pad is local role-play, with no external service.

Each registered inventor starts with 20 coins and keeps separate progress, an unfinished round, theme, and sound preference. For an older notebook without a password, register its existing name to keep all its progress. Use **Leave Lab** to return to reception and enter as someone else. Reloading also returns to the access pad without resetting saves. Use one browser tab at a time.

Each lever costs one coin and rerolls only its own word. Enter an invention name, then choose **Buy 5**, **10**, **50**, or **Don’t Buy**. Every completed invention is saved and the machine resets. The coin bag beside the machine shows the current balance. At zero coins, **Free Restart Bonus** adds ten coins without affecting sale earnings.

Each lever reveals one word or one lexical unit, such as a compound noun (`ice cream`) or phrasal verb (`takes off`). Lists contain ingredients for an idea rather than full descriptions: `dragon` + `pocket` leaves the student to explain how the dragon fits in a pocket. Word displays use fixed boxes; short entries appear larger and longer entries shrink to fit on one line. Text refits after rerolls, theme switches, and resizing.

**My Inventions**, **Achievements**, and **Statistics** appear after lab access is granted. The **settings gear** opens the sound and theme controls. Mechanical levers are drawn and animated in CSS; the tabletop background and coin bag are local images.

Saves use browser local storage. Clearing browser data or using a different browser/device does not preserve progress. **Statistics → Export backup** downloads all local notebooks as JSON for safekeeping; this version does not include a backup import interface. A visible warning appears if saving fails.

## Checks

```powershell
npm run check
npm test
npm run test:browser
```

The syntax/asset check and Node's built-in test runner require no packages. Tests cover economy, rerolls, sale validation, all sale outcomes, round reset, achievements, profile isolation, persistence, malformed saves, and conflicting tabs.

The browser test uses headless Chrome and Node.js 22 or newer, opens a disposable browser profile, and checks real UI interactions and desktop layouts. It expects Chrome at its standard Windows installation path; set `CHROME_PATH` if yours differs. Screenshots are saved in `artifacts/`. The test starts its own local server; stop `npm start` first. Sound quality should be checked manually.

## Manual test checklist

- Pull each lever: balance goes 20 → 19 → 18; reroll one and verify the other stays fixed. Try rapid double clicks.
- Confirm sale controls stay disabled until both words and a nonblank name exist.
- Try each sale amount and Don’t Buy; check collection entries, balance, statistics, and round reset.
- Spend down to zero; claim the ten-coin bonus and check that earned coins do not increase.
- Make a first sale and a 50-coin sale; check achievement popups and permanent badges.
- Switch all three themes and toggle sound. Reload mid-round and after a sale to check persistence.
- Register a second inventor, try an incorrect password, then leave and re-enter each lab; progress should remain separate.
- Check the lab at 1366×768, 1440×900, and 1920×1080, and navigate controls with Tab and Enter.

## Project layout

`index.html` contains the screens; `css/` contains shared layout and themes. `css/lab-experience.css` styles reception, the access pad, settings, the cashbag, and mechanical levers. `js/` separates game rules, words, achievements, storage, local access, sound, themes, and interface control. `assets/images/cartoon/` holds the machine and workshop; `assets/images/shared/` holds the coin bag. Passwords are stored as salted digests alongside local profiles. Sounds use Web Audio. `tests/` contains rule/storage/access tests. `scripts/` contains the local server and checks.

Edit `js/config.js` for starting coins, lever cost, and bonus amount. Curated word lists are in `js/words.js`. The game plan remains the detailed product specification, with this version using local storage only.
