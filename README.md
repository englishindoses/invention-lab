# The Invention Lab

Hosted game: https://englishindoses.github.io/invention-lab/

GitHub Pages serves the static app from `main` at the repository root, with no build step. Publish updates by committing and pushing to `main`. Localhost and the hosted site have separate browser saves; existing local notebooks do not transfer automatically.

A teacher-controlled speaking game with two word levers, a coin economy, invention collection, ten achievements, lifetime statistics, three visual themes, and optional sound effects. Everything runs locally; no external services or dependencies are needed.

## Open the game

Recommended: open PowerShell in this folder and run:

```powershell
npm.cmd start
```

Open **http://127.0.0.1:4173** in Chrome. Leave the terminal running; press **Ctrl+C** to stop it. Node.js must be installed. No `npm install` or build step is needed.

You can also double-click `index.html` to play directly. Browser storage behavior for local files varies; the local server is recommended for consistent saving. Always use the same browser and address: file mode, localhost, and 127.0.0.1 have separate saves.

## Play and save

Click **How to Play** in the game for instructions at any time, including before registration.

### Run a lesson

1. Open the game in Chrome and share your screen. The teacher clicks and types; the student explains their ideas aloud.
2. For a new student, complete **Register Inventor**, then use the same name and password in **Lab Access**. Returning students go straight to **Lab Access**.
3. Pull both levers to reveal two words. Each pull costs **1 inventor coin**. Reroll either lever if needed; the other word stays fixed.
4. Ask the student to combine the words into an invention, explain it, and persuade you to buy it. You lead the conversation.
5. Type the student's **Invention name**. Both words and a nonblank name are required for all sale decisions.
6. Choose **Buy 10**, **50**, **100**, or **Don't Buy**. Buying moves that amount from your customer wallet to the inventor. Every decision saves the invention and resets the machine. Pull both levers to begin again.
7. Finish with **Leave Lab**. Use the same browser and site address next lesson to return to the student's saved progress.

Inventors begin with **20 coins**. At zero, **Free Restart Bonus** gives **10 coins**. Your customer wallet begins each login with **300 coins**; purchases beyond its remaining balance are disabled. Leaving and logging in again refreshes the customer budget while keeping inventor progress.

### Explore and back up

- **My Inventions**: review sold and unsold inventions. **Achievements** and **Statistics** show lifetime progress.
- **Settings gear**: choose a theme or turn sound on/off.
- **Shop → Add Item**: upload an invention picture and choose a name, shelf, and page. Click an existing item to edit or remove it. Shop pictures are separate from saved gameplay history.
- **Statistics → Export backup**: download all local notebooks. Notebook backup import is not implemented.
- **Shop → Export Shop / Import Shop**: transfer shop pictures and shelves. Import replaces the current student's shop, so export it first if you need to keep it.

Saves are local to the browser, device, and site address. Clearing browser data can erase them; export backups before doing so. Use one game tab at a time.

### Access and saving details

On the homepage, fill in **Register Inventor** with a name and password. Then enter those details on the **Lab Access** pad. Matching details show green **Access Granted** and open the lab; an unknown name or incorrect password shows red **Access Denied**. Names are case-insensitive; passwords are case-sensitive. The access pad is local role-play, with no external service.

Each registered inventor starts with 20 coins and keeps separate progress, an unfinished round, theme, and sound preference. For an older notebook without a password, register its existing name to keep all its progress. Refreshing keeps you signed in on the same screen with the remaining customer budget, using this tab's session storage. Use **Leave Lab** to end the lesson and return to reception. The next successful login starts a new lesson. Use one browser tab at a time.

Each lever costs one coin and rerolls only its own word. Enter an invention name, then choose **Buy 10**, **50**, **100**, or **Don’t Buy**. Every completed invention is saved and the machine resets. The coin bag beside the machine shows the current balance. At zero coins, **Free Restart Bonus** adds ten coins without affecting sale earnings.

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

Edit `js/config.js` for starting coins, lever cost, and bonus amount. Curated word lists are in `js/words.js`. Student progress uses localStorage, lesson access uses sessionStorage, and uploaded shop images use IndexedDB. No server-side account or storage service is required.
# Customer lesson budget

The customer's wallet starts with 300 coins, configured as `customerStartingCoins` in `js/config.js`. Each successful login starts a new lesson budget. Purchases deduct the sale price from this wallet and add it to the inventor's saved coins. Unaffordable purchases are disabled; Don't Buy remains available. Navigating between screens and refreshing preserve the remaining wallet balance. Use Leave Lab and log in again to start a fresh lesson budget. Customer coins are stored in tab session storage, separately from saved student progress; no passwords are stored in the session.

## Personal shops

Open Shop and click Add Item (or any empty shelf). Choose an image, enter an invention name, and select its shelf and page. Click an item to rename it, move it, replace its image, or remove it. Occupied shelves cannot be overwritten by another item; use another shelf or a new shelf page. PNG, JPEG, WebP, and GIF files up to 8 MB are supported; PNG transparency is preserved. Uploaded still images have empty transparent margins trimmed and fit inside their shelf without stretching or cutting off the invention. Moving an item automatically fits it to its new shelf. Animated GIFs retain their original framing. A shop can hold up to 100 items across up to 100 shelf pages.

Uploaded images stay in this browser on this device, per inventor profile ID. They are not sent to GitHub or other players. Existing coins, history, achievements, settings, and profiles are unchanged. Ann's former built-in images have been removed from the published files; browser-uploaded images are unaffected. Older shop snapshots that reference those published files need replacement uploads or an image-inclusive backup import.

Export Shop downloads a JSON backup containing the names, shelf positions, and image bytes. Import Shop restores a backup into the currently signed-in inventor's shop, replacing only that shop's items. Export before replacing a shop if you want to preserve it. Invalid backups or failed saves leave the previous shop intact. Backups are limited to 100 MB and can be imported in another browser or device. Clearing browser/site data may erase local shops; use backups. Localhost and GitHub Pages have separate browser storage, so transfer shops with export/import.

`js/shop-storage.js` owns the separate IndexedDB database and backup format; `js/shop.js` owns display and editing controls. `python scripts/check-shop.py` verifies uploads, moves, removals, refresh persistence, occupied shelves, invalid imports, storage failures, backup transfer, profile isolation, and preservation of legacy profile data alongside theme/layout and wallet checks.

The customer wallet is inside the sale panel. Use the gear beside the wallet balance to adjust the lesson total; purchases already made remain deducted. The limit survives refresh and resets to 300 when starting a new lesson.
