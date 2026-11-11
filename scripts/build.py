#!/usr/bin/env python3
"""Build a deterministic installable ZIP using only Python's standard library."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parent.parent
version = json.loads((root / 'manifest.json').read_text())['version']
dist = root / 'dist'
dist.mkdir(exist_ok=True)
archive = dist / f'reddit-app-nag-blocker-v{version}.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as output:
    for name in ['manifest.json', 'content.js', 'LICENSE', 'PRIVACY.md', 'INSTALL.md']:
        info = zipfile.ZipInfo(f'reddit-app-nag-blocker/{name}', (2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        output.writestr(info, (root / name).read_bytes())
with zipfile.ZipFile(archive) as result:
    assert result.testzip() is None
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
(dist / 'SHA256SUMS').write_text(f'{digest}  {archive.name}\n')
print(archive)
print(f'SHA-256: {digest}')
