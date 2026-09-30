const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { webcrypto } = require('node:crypto');
function setup(storage) {
  const context = vm.createContext({ window: {}, crypto: webcrypto, TextEncoder, localStorage: storage });
  vm.runInContext('window = this', context);
  for (const file of ['config', 'words', 'achievements', 'game', 'storage', 'access']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', `${file}.js`), 'utf8'), context);
  return context.Lab;
}
function ready(Lab, p) { Lab.pull(p, 0); Lab.pull(p, 1); p.round.name = 'Cloud Shoes'; }
test('independent pulls cost one coin and exclude the current word', () => {
  const Lab = setup(); const p = Lab.newProfile('A');
  Lab.pull(p, 0, () => 0); const first = p.round.words[0];
  assert.equal(p.coins, 19); assert.equal(p.round.words[1], '');
  Lab.pull(p, 0, () => 0);
  assert.notEqual(p.round.words[0], first); assert.equal(p.coins, 18);
  assert.equal(p.stats.pulls, 2); assert.equal(p.stats.spent, 2);
});
test('zero coins block pulls; bonus is repeat-safe and does not affect sales totals', () => {
  const Lab = setup(); const p = Lab.newProfile('A');
  for (let i = 0; i < 20; i++) assert.ok(Lab.pull(p, 0));
  assert.equal(Lab.pull(p, 1), false); assert.equal(p.coins, 0);
  assert.ok(Lab.bonus(p)); assert.equal(Lab.bonus(p), false);
  assert.equal(p.coins, 10); assert.equal(p.stats.earned, 0); assert.equal(p.stats.created, 0);
});
test('all sale outcomes save the original words, update totals, and reset the round', () => {
  for (const price of [0, 5, 10, 50]) {
    const Lab = setup(); const p = Lab.newProfile('A'); ready(Lab, p);
    const words = [...p.round.words];
    const record = Lab.sell(p, price);
    assert.equal(p.coins, 18 + price); assert.equal(p.stats.created, 1);
    assert.equal(p.stats.sold, price ? 1 : 0); assert.equal(p.stats.earned, price);
    assert.equal(record.word1, words[0]); assert.equal(record.word2, words[1]);
    assert.equal(record.salePrice, price); assert.equal(record.sold, price > 0);
    assert.equal(p.round.name, ''); assert.ok(p.round.words.every(word => word === ''));
    assert.equal(Lab.sell(p, price), false); assert.equal(p.inventions.length, 1);
  }
});
test('incomplete, unnamed, whitespace-only, and invalid-price sales are rejected', () => {
  const Lab = setup(); const p = Lab.newProfile('A');
  assert.equal(Lab.sell(p, 5), false); Lab.pull(p, 0); p.round.name = 'Name';
  assert.equal(Lab.sell(p, 5), false); Lab.pull(p, 1); p.round.name = '   ';
  assert.equal(Lab.sell(p, 5), false); p.round.name = 'Name';
  assert.equal(Lab.sell(p, 100), false); assert.equal(p.inventions.length, 0);
});
test('all ten achievements unlock at their thresholds and remain permanent', () => {
  const Lab = setup(); const p = Lab.newProfile('A');
  assert.equal(Lab.unlock(p).length, 0);
  for (let i = 0; i < 20; i++) { ready(Lab, p); Lab.sell(p, 50); Lab.unlock(p); }
  while (p.stats.pulls < 100) Lab.pull(p, 0);
  Lab.unlock(p); assert.equal(Object.keys(p.achievements).length, 10);
  const timestamp = p.achievements.first;
  assert.equal(Lab.unlock(p).length, 0); assert.equal(p.achievements.first, timestamp);
});
test('profiles have independent balances, preferences, history, and rounds', () => {
  const Lab = setup(); const a = Lab.newProfile('A'); const b = Lab.newProfile('B');
  ready(Lab, a); Lab.sell(a, 50); a.theme = 'magic'; a.sound = false;
  assert.notEqual(a.id, b.id); assert.equal(b.coins, 20); assert.equal(b.inventions.length, 0);
  assert.equal(b.theme, 'cartoon'); assert.equal(b.sound, true); assert.equal(b.round.words[0], '');
});
test('each achievement unlocks exactly at its threshold', () => {
  const Lab = setup();
  for (const badge of Lab.achievements) {
    const p = Lab.newProfile('A');
    p.stats[badge.stat] = badge.target - 1;
    Lab.unlock(p); assert.equal(p.achievements[badge.id], undefined);
    p.stats[badge.stat] = badge.target;
    Lab.unlock(p); assert.ok(p.achievements[badge.id]);
  }
});
test('local storage round trip preserves profiles, progress, preferences, and unfinished rounds', () => {
  const store = new Map(); const storage = { getItem: k => store.get(k) || null, setItem: (k, v) => store.set(k, v) };
  const Lab = setup(storage); Lab.storage.load(); const p = Lab.newProfile('A');
  ready(Lab, p); Lab.sell(p, 50); Lab.unlock(p); ready(Lab, p); p.theme = 'future'; p.sound = false;
  const data = { version: 1, active: p.id, profiles: [p] };
  assert.equal(Lab.storage.save(data), true);
  assert.equal(JSON.stringify(setup(storage).storage.load().data), JSON.stringify(data));
});
test('malformed saves remain untouched and storage errors are handled', () => {
  let raw = '{broken'; const storage = { getItem: () => raw, setItem: (k, v) => { raw = v; } };
  const Lab = setup(storage); assert.ok(Lab.storage.load().error);
  assert.equal(Lab.storage.save({}), false); assert.equal(raw, '{broken');
  const failed = setup({ getItem() { throw new Error('Blocked'); } });
  assert.ok(failed.storage.load().error); assert.equal(failed.storage.save({}), false);
});
test('concurrent changes are not silently overwritten', () => {
  let raw = null; const storage = { getItem: () => raw, setItem: (k, v) => { raw = v; } };
  const Lab = setup(storage); Lab.storage.load(); raw = 'another tab';
  assert.equal(Lab.storage.save({}), false); assert.equal(raw, 'another tab');
});
test('full storage reports failure and can recover when space becomes available', () => {
  let full = true; let raw = null;
  const storage = { getItem: () => raw, setItem: (k, value) => { if (full) throw new Error('Quota exceeded'); raw = value; } };
  const Lab = setup(storage); Lab.storage.load(); const p = Lab.newProfile('A');
  const data = { version: 1, active: p.id, profiles: [p] };
  assert.equal(Lab.storage.save(data), false); assert.equal(raw, null);
  full = false; assert.equal(Lab.storage.save(data), true);
  assert.equal(JSON.parse(raw).active, p.id);
});
test('registration checks names and passwords and never stores the entered password', async () => {
  const Lab = setup(); const data = { version: 1, active: null, profiles: [] };
  const p = await Lab.access.register(data, '  Ada  ', 'Moon Rocket');
  assert.equal(p.name, 'Ada'); assert.equal(data.active, p.id);
  assert.equal(JSON.stringify(data).includes('Moon Rocket'), false);
  assert.equal((await Lab.access.match(data, ' ada ', 'Moon Rocket')).id, p.id);
  assert.equal(await Lab.access.match(data, 'Ada', 'moon rocket'), null);
  assert.equal(await Lab.access.match(data, 'Unknown', 'Moon Rocket'), null);
  await assert.rejects(Lab.access.register(data, 'ADA', 'changed'), /already registered/);
  assert.equal(data.profiles.length, 1);
  assert.equal((await Lab.access.match(data, 'Ada', 'Moon Rocket')).id, p.id);
});
test('blank registration and overlong inputs are rejected without creating profiles', async () => {
  const Lab = setup(); const data = { version: 1, active: null, profiles: [] };
  for (const [name, password] of [['  ', 'pass'], ['Ada', '  '], ['A'.repeat(41), 'pass'], ['Ada', 'x'.repeat(129)]]) {
    await assert.rejects(Lab.access.register(data, name, password));
  }
  assert.equal(data.profiles.length, 0);
});
test('registering an older notebook preserves all saved progress and preferences', async () => {
  const Lab = setup(); const p = Lab.newProfile('Inventor'); ready(Lab, p); Lab.sell(p, 50); Lab.unlock(p);
  p.theme = 'magic'; p.sound = false; ready(Lab, p);
  const before = JSON.stringify(p); const data = { version: 1, active: p.id, profiles: [p] };
  assert.equal(await Lab.access.match(data, 'Inventor', 'anything'), null);
  await Lab.access.register(data, 'inventor', 'stars');
  const { access, ...unchanged } = p;
  assert.equal(JSON.stringify(unchanged), before); assert.equal(data.profiles.length, 1);
  assert.ok(access.passwordDigest);
});
test('empty reception saves and registered profiles can reload from local storage', async () => {
  let raw = null;
  const storage = { getItem: () => raw, setItem: (key, value) => { raw = value; } };
  const Lab = setup(storage); Lab.storage.load(); const data = { version: 1, active: null, profiles: [] };
  assert.ok(Lab.storage.save(data)); assert.equal(setup(storage).storage.load().data.profiles.length, 0);
  await Lab.access.register(data, 'Ada', 'stars'); assert.ok(Lab.storage.save(data));
  const reloaded = setup(storage); const saved = reloaded.storage.load().data;
  assert.equal((await reloaded.access.match(saved, 'Ada', 'stars')).name, 'Ada');
});
