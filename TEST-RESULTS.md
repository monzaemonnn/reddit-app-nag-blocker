# Testing status

## Completed

- JavaScript syntax checks.
- Manifest version, required files, and Reddit-only host-scope checks.
- Review for network requests, remote code, credential/storage access, and extra permissions.
- Install ZIP contents and archive integrity checks.

The initial 1.0.0 version was reported working by its first user. The 1.0.1 changes have not been verified live.

## Not completed in the preparation environment

Browser fixture execution was blocked before Chromium started: the environment disallows a socket Chromium needs. The connected-browser inspection also failed with an authorization error. These are blocked checks, not passes.

The [first GitHub Actions run](https://github.com/monzaemonnn/reddit-app-nag-blocker/actions/runs/43006880777) also failed before any job steps executed. No test logs were produced, and the failure annotation could not be retrieved through the available connection. This is not evidence of passing or failing extension behavior. The downloadable ZIP is a release candidate, not a browser-verified stable release.

`npm test` runs the browser fixture suite in `tests/test-extension.cjs` on a development machine with Node.js, Playwright, and a compatible Chromium. It checks removal and reinsertion, fixed overlays, restored scrolling, open and late-attached shadow roots, delayed text, and preservation of posts and unrelated dialogs.

Fixtures do not reproduce every live Reddit experiment. Before marking a release stable, run the suite successfully and verify the affected live page and ordinary dialogs manually. Do not describe this build as browser-tested until that is done.
