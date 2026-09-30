const { readdirSync, readFileSync, existsSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const root = resolve(__dirname, '..');
for (const folder of ['js', 'scripts', 'tests']) {
  for (const name of readdirSync(join(root, folder)).filter(name => /\.(js|cjs)$/.test(name))) {
    const result = spawnSync(process.execPath, ['--check', join(root, folder, name)], { encoding: 'utf8' });
    if (result.status !== 0) { console.error(result.stderr); process.exit(1); }
  }
}
const html = readFileSync(join(root, 'index.html'), 'utf8');
for (const [, resource] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (!existsSync(join(root, resource))) throw new Error(`Missing resource: ${resource}`);
}
console.log('JavaScript syntax and HTML asset references passed.');
