// Integration checks in a disposable Chrome profile. No packages required.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'invention-lab-test-'));
let browser;
let server;
let socket;
let id = 0;
const pending = new Map();
const errors = [];
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const messageId = ++id;
    const timer = setTimeout(() => { pending.delete(messageId); reject(new Error(`Timeout: ${method}`)); }, 15000);
    pending.set(messageId, { resolve, reject, timer });
    socket.send(JSON.stringify({ id: messageId, method, params }));
  });
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const input = (selector, value) => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
const change = (selector, value) => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event('change', { bubbles: true })); })()`);
const state = () => evaluate(`JSON.parse(localStorage.getItem('invention-lab-v1'))`);
async function active() { const data = await state(); return data.profiles.find(p => p.id === data.active); }
async function load() {
  for (let i = 0; i < 60; i++) {
    if (await evaluate(`document.readyState === 'complete' && document.body.dataset.ready === 'true'`)) return;
    await wait(100);
  }
  throw new Error('App did not load');
}
async function round(name, price) {
  await click('#lever-0'); await click('#lever-1'); await wait(800);
  await input('#invention-name', name);
  assert.equal(await evaluate(`document.querySelector('[data-price="${price}"]').disabled`), false);
  await click(`[data-price="${price}"]`);
  await click(`[data-price="${price}"]`);
  await wait(1200);
}
async function until(expression, message) {
  for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await wait(50); }
  throw new Error(message);
}
async function register(name, password) {
  await input('#register-name', name); await input('#register-password', password); await click('#register-submit');
  await until(`document.querySelector('#register-status').dataset.state === 'granted'`, 'Registration succeeds');
}
async function enter(name, password) {
  await input('#access-name', name); await input('#access-password', password); await click('#access-submit');
  await until(`document.querySelector('#access-status').dataset.state === 'granted'`, 'Access granted appears');
  await until(`document.body.dataset.view === 'lab'`, 'Successful access enters the lab');
}
async function capture(name) {
  fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
  const shot = await command('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(root, 'artifacts', name + '.png'), Buffer.from(shot.data, 'base64'));
}
(async () => {
  assert.ok(fs.existsSync(chrome), 'Set CHROME_PATH to a Chrome executable');
  server = spawn(process.execPath, ['scripts/serve.cjs'], { cwd: root, windowsHide: true, stdio: 'ignore' });
  server.on('error', error => errors.push(error.message));
  browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${temp}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  browser.on('error', error => errors.push(error.message));
  const portFile = path.join(temp, 'DevToolsActivePort');
  let port;
  for (let i = 0; i < 100 && !port; i++) {
    try { port = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim(); }
    catch (error) { if (!['ENOENT', 'EBUSY'].includes(error.code)) throw error; }
    if (!port) await wait(100);
  }
  assert.ok(port, 'Chrome debugging port became available');
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(JSON.stringify(message.params.exceptionDetails));
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(message.params.entry.text);
    if (pending.has(message.id)) {
      const item = pending.get(message.id); pending.delete(message.id); clearTimeout(item.timer);
      if (message.error) item.reject(new Error(JSON.stringify(message.error))); else item.resolve(message.result);
    }
  });
  await command('Runtime.enable'); await command('Log.enable'); await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await command('Page.navigate', { url: 'http://127.0.0.1:4173' }); await wait(300); await load();
  assert.equal((await state()).profiles.length, 0);
  assert.equal(await evaluate(`document.querySelector('#lab-nav').hidden`), true);
  await click('[data-view="collection"]');
  assert.equal(await evaluate(`document.body.dataset.view`), 'home', 'Private screens do not open from reception');
  await input('#access-name', 'Unknown'); await input('#access-password', 'nope'); await click('#access-submit');
  await until(`document.querySelector('#access-status').dataset.state === 'denied'`, 'Unknown inventor is denied');
  await register('Test Inventor', 'rocket');
  await capture('reception');
  await input('#access-name', 'Test Inventor'); await input('#access-password', 'wrong'); await click('#access-submit');
  await until(`document.querySelector('#access-status').dataset.state === 'denied'`, 'Wrong password is denied');
  await capture('access-denied');
  await enter('Test Inventor', 'rocket');
  await click('[data-view="shop"]');
  assert.equal(await evaluate(`document.body.dataset.view`), 'shop');
  assert.equal(await evaluate(`document.querySelectorAll('.shop-slot').length`), 23);
  assert.ok((await evaluate(`getComputedStyle(document.body).backgroundImage`)).includes('cartoon/shop-background.png'), 'Shop artwork matches the active cartoon theme');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('main')).padding`), '0px', 'Shop has no content-card padding');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('footer')).display`), 'none');
  assert.equal(await evaluate(`(() => { const stage = document.querySelector('.shop-stage').getBoundingClientRect(); return stage.left <= 0 && stage.top <= 0 && stage.right >= innerWidth && stage.bottom >= innerHeight && [...document.querySelectorAll('.shop-slot')].every(slot => { const box = slot.getBoundingClientRect(); return box.left >= stage.left && box.right <= stage.right && box.top >= stage.top && box.bottom <= stage.bottom; }); })()`), true, 'Shop covers the viewport and displays follow the artwork');
  await capture('magic-shop');
  await click('[data-view="lab"]');
  assert.equal((await active()).coins, 20);
  assert.equal(await evaluate(`document.querySelector('#lab-nav').hidden`), false);
  assert.equal(await evaluate(`Promise.all(['assets/images/cartoon/machine-body.png', 'assets/images/cartoon/workshop-background-quiet.png', 'assets/images/shared/coin-bag.png'].map(src => new Promise(resolve => { const image = new Image(); image.onload = () => resolve(image.naturalWidth > 0); image.onerror = () => resolve(false); image.src = src; }))).then(results => results.every(Boolean))`), true, 'Artwork loads');
  // Real pointer input verifies the larger lever can be clicked, not just triggered by script.
  const target = await evaluate(`(() => { const r = document.querySelector('#lever-0').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...target });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...target });
  await wait(800);
  assert.equal((await active()).coins, 19, 'Mechanical lever responds to pointer');
  // Return to a clean registered notebook for the economy checks below.
  await command('Page.reload'); await wait(250); await load();
  await click('#leave-lab');
  await register('Gameplay Inventor', 'rocket'); await enter('Gameplay Inventor', 'rocket');
  assert.equal(await evaluate(`document.querySelector('[data-price="5"]').disabled`), true);
  await click('#lever-0'); await click('#lever-0'); await wait(800);
  assert.equal((await active()).coins, 19, 'Double-click spends only once');
  const firstWord = (await active()).round.words[0];
  await click('#lever-1'); await wait(800);
  await click('#lever-1'); await wait(800);
  assert.equal((await active()).round.words[0], firstWord);
  assert.equal((await active()).coins, 17);
  await input('#invention-name', '   ');
  assert.equal(await evaluate(`document.querySelector('[data-price="5"]').disabled`), true);
  await input('#invention-name', '<b>Cloud Shoes</b>');
  await click('[data-price="5"]'); await click('[data-price="5"]'); await wait(1200);
  assert.equal((await active()).coins, 22); assert.equal((await active()).inventions.length, 1);
  for (const price of [10, 50, 0]) await round(`Idea ${price}`, price);
  let p = await active();
  assert.equal(p.stats.created, 4); assert.equal(p.stats.sold, 3); assert.equal(p.stats.earned, 65);
  assert.ok(p.achievements.first); assert.ok(p.achievements.big);
  await click('[data-view="collection"]');
  assert.equal(await evaluate(`document.querySelectorAll('.invention-card').length`), 4);
  assert.equal(await evaluate(`document.querySelector('#collection b') === null`), true, 'Invention names render as text');
  await change('#collection-filter', 'unsold');
  assert.equal(await evaluate(`document.querySelectorAll('.invention-card').length`), 1);
  await click('[data-view="achievements"]');
  assert.equal(await evaluate(`document.querySelectorAll('.badge-card').length`), 10);
  await click('[data-view="stats"]');
  assert.equal(await evaluate(`document.querySelectorAll('.stat-card').length`), 6);
  await click('[data-view="lab"]');
  fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
  for (const theme of ['cartoon', 'future', 'magic']) {
    await click('#settings');
    assert.equal(await evaluate(`document.querySelector('#settings-dialog').open`), true);
    await change('#theme', theme);
    await click('#close-settings');
    for (const [width, height] of [[1366, 768], [1440, 900], [1920, 1080]]) {
      await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      await wait(120);
      {
        const failures = await evaluate(`(() => {
          const failures = [];
          Lab.words.forEach((words, index) => {
            const display = document.querySelector('#word-' + index);
            const original = display.textContent;
            display.classList.remove('empty');
            for (const word of words) {
              display.textContent = word;
              Lab.fitWord(display);
              const text = display.getBoundingClientRect();
              const slot = display.parentElement.getBoundingClientRect();
              if (text.left < slot.left - 1 || text.right > slot.right + 1 || text.top < slot.top - 1 || text.bottom > slot.bottom + 1 || display.scrollWidth > display.clientWidth || display.scrollHeight > display.clientHeight) failures.push(word);
            }
            display.textContent = original;
            display.classList.add('empty');
          });
          return failures;
        })()`);
        assert.deepEqual(failures, [], `${theme}: all curated words fit the fixed text boxes`);
        const sizing = await evaluate(`(() => {
          const display = document.querySelector('#word-0');
          const original = display.textContent;
          display.classList.remove('empty');
          display.textContent = 'cat'; Lab.fitWord(display);
          const shortSize = parseFloat(getComputedStyle(display).fontSize);
          const boxWidth = display.clientWidth;
          display.textContent = 'washing machine'; Lab.fitWord(display);
          const longSize = parseFloat(getComputedStyle(display).fontSize);
          const fits = display.scrollWidth <= display.clientWidth && display.scrollHeight <= display.clientHeight;
          const sameBox = display.clientWidth === boxWidth;
          display.textContent = original; display.classList.add('empty'); Lab.fitWord(display);
          return { shortSize, longSize, fits, sameBox };
        })()`);
        assert.ok(sizing.shortSize > sizing.longSize && sizing.fits && sizing.sameBox, `${theme}: longer entries shrink inside the same box`);
      }
      const layout = await evaluate(`({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, bottom: document.querySelector('.sale-panel').getBoundingClientRect().bottom, sections: [...document.querySelectorAll('.topbar,.workspace-bar,main,footer,.section-heading,.lab-layout')].filter(e => e.getBoundingClientRect().height).map(e => [e.className || e.tagName, e.getBoundingClientRect().height]) })`);
      if (layout.scrollHeight > height) {
        console.log(layout);
        const shot = await command('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(root, 'artifacts', 'layout-debug.png'), Buffer.from(shot.data, 'base64'));
      }
      assert.ok(layout.scrollWidth <= width, `${theme} horizontal overflow at ${width}`);
      assert.ok(layout.bottom <= height, `${theme} sale controls below fold at ${width}`);
      assert.ok(layout.scrollHeight <= height, `${theme} vertical overflow at ${width}: ${layout.scrollHeight}`);
      assert.ok(await evaluate(`(() => { const r = document.querySelector('.cashbag').getBoundingClientRect(); return r.bottom <= innerHeight && r.right <= innerWidth && r.width > 100; })()`), 'Coin bag is visible beside the machine');
    }
    await command('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
    await evaluate(`document.querySelector('#word-0').textContent = 'backpack'; document.querySelector('#word-1').textContent = 'reads minds'; document.querySelectorAll('.word-display').forEach(el => el.classList.remove('empty'))`);
    const shot = await command('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(root, 'artifacts', `lab-${theme}.png`), Buffer.from(shot.data, 'base64'));
  }
  await click('#settings'); await click('#sound'); await click('#close-settings');
  await click('#lever-0'); await wait(800); await input('#invention-name', 'Unfinished idea');
  const before = await active();
  await command('Page.reload'); await wait(300); await load();
  assert.deepEqual(await active(), before, 'Reload preserves all profile data');
  assert.equal(await evaluate(`document.body.dataset.view`), 'lab', 'Reload stays in the lab');
  assert.equal(await evaluate(`document.querySelector('#lab-nav').hidden`), false);
  assert.equal(await evaluate(`document.documentElement.dataset.theme`), 'magic');
  await click('#leave-lab');
  await register('Second Inventor', 'stars'); await enter('Second Inventor', 'stars');
  assert.equal((await active()).coins, 20); assert.equal((await active()).inventions.length, 0);
  await click('#leave-lab'); await enter('Gameplay Inventor', 'rocket'); assert.deepEqual(await active(), before);
  // Reach zero through real controls with reduced motion enabled.
  await click('#leave-lab'); await enter('Second Inventor', 'stars');
  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (let i = 0; i < 20; i++) { await click('#lever-0'); await wait(130); }
  assert.equal((await active()).coins, 0);
  assert.equal(await evaluate(`document.querySelector('#bonus').hidden`), false);
  assert.ok(await evaluate(`document.querySelector('#bonus').getBoundingClientRect().bottom <= innerHeight`), 'Restart bonus remains visible');
  await click('#bonus'); await click('#bonus'); assert.equal((await active()).coins, 10); assert.equal((await active()).stats.earned, 0);
  assert.equal(await evaluate(`document.querySelector('#balance').textContent`), '10');
  assert.deepEqual(errors, [], 'No browser errors');
  console.log('PASS: Chrome controls, all sale outcomes, double clicks, collection filtering, achievements, stats, 9 theme/viewport combinations, reload persistence, profile isolation, zero-coin recovery, and no browser errors.');
  console.log('Screenshots: artifacts/lab-{cartoon,future,magic}.png');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (socket?.readyState === WebSocket.OPEN) { try { await command('Browser.close'); } catch {} socket.close(); }
  browser?.kill(); server?.kill();
});
