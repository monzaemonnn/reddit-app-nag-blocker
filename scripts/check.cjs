const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.version, pkg.version);
assert.equal(manifest.background, undefined);
assert.equal(manifest.permissions, undefined);
assert.equal(manifest.host_permissions, undefined);
const expected = new Set(['reddit.com', 'www.reddit.com', 'new.reddit.com', 'old.reddit.com', 'sh.reddit.com', 'm.reddit.com']);
assert.equal(manifest.content_scripts.length, 1);
for (const script of manifest.content_scripts) {
  assert.equal(script.run_at, 'document_start');
  assert.equal(script.matches.length, expected.size);
  for (const pattern of script.matches) {
    const url = new URL(pattern);
    assert.equal(url.protocol, 'https:');
    assert(expected.delete(url.hostname), `Unexpected or repeated host: ${url.hostname}`);
    assert.equal(url.pathname, '/*');
  }
  for (const file of script.js) assert(fs.statSync(path.join(root, file)).isFile());
}
assert.equal(expected.size, 0);
for (const file of ['LICENSE', 'README.md', 'PRIVACY.md', 'TEST-RESULTS.md']) assert(fs.statSync(path.join(root, file)).isFile());
console.log('PASS: Manifest V3, version consistency, script files, narrow host scope, and documentation.');
