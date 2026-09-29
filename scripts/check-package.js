'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const pkg = require('../package.json');
const archive = path.join(root, `${pkg.name}-${pkg.version}.tgz`);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pocket-package-'));
try {
  const entries = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' })
    .trim()
    .split('\n');
  assert(
    !entries.some((entry) =>
      /(?:^|\/)(?:node_modules|\.cache|\.git)\//.test(entry),
    ),
    'private/development files leaked into package',
  );
  for (const file of [
    'LICENSE',
    'NOTICE.md',
    'THIRD_PARTY_NOTICES.md',
    'dist/v1/metadata.json',
  ])
    assert(
      entries.includes(`package/${file}`),
      `${file}: missing from package`,
    );
  execFileSync('tar', ['-xzf', archive, '-C', temporary]);
  // Fresh process: resolves only packaged runtime dependencies.
  execFileSync(process.execPath, [
    '-e',
    `const assert=require('node:assert/strict');const p=require(${JSON.stringify(path.join(temporary, 'package'))});const m=require(${JSON.stringify(path.join(temporary, 'package/dist/v1/metadata.json'))});assert.equal(p.database.cards.length,m.cardCount);assert.equal(p.en.geneticApex[0].id,'a1-001');assert(p.database.findById('p-b-094'));`,
  ]);
  console.log(
    'Packaged data and legacy/enriched imports work without development dependencies.',
  );
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
