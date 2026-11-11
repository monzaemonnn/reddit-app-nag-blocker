# Publishing

Public repository: `monzaemonnn/reddit-app-nag-blocker`.

The source tree is ready to upload. Do not upload `node_modules`, temporary browser profiles, personal screenshots, or credentials. The extension has no secrets or runtime build dependencies.

## Source publication

Push changes to `main` or open a pull request. The Check and release candidate workflow runs static checks and the browser fixture suite in GitHub's runner.

The project already includes an MIT license, README, privacy notice, install guide, contribution notes, and test status. Publish that status honestly: the original version was user-reported working, and automated browser execution was blocked in the preparation environment.

## Release candidate

1. Run `npm install --ignore-scripts`, `npx playwright install chromium`, `npm run check`, and `npm test` on a development machine.
2. Verify the live affected prompt and ordinary report/login dialogs manually.
3. Update `TEST-RESULTS.md` with checks actually completed. If browser tests remain blocked, label the release a **pre-release** and keep that limitation visible.
4. Run `python3 scripts/build.py`.
5. The workflow automatically publishes a new manifest version as a pre-release after checks pass on `main`, attaching the ZIP and `SHA256SUMS`. Existing versions are not overwritten. To publish a later version, update both version fields, the changelog, and the release notes. You can rerun the workflow manually from the Actions tab.

This repository is separate from a Chrome Web Store listing. A store submission would be a later, separate distribution step.
