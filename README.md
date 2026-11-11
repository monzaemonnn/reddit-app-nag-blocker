# Reddit App Nag Blocker

Keep browsing Reddit in your browser.

A small, open-source Chrome extension that removes the **“Get the best of Reddit in the app”** overlay and releases its page scroll lock. No account setup, tracking, external requests, or runtime dependencies.

**[Download v1.0.1 ZIP](https://github.com/monzaemonnn/reddit-app-nag-blocker/raw/refs/heads/main/downloads/reddit-app-nag-blocker-v1.0.1.zip)** · [Source code](content.js) · [SHA-256 checksum](downloads/SHA256SUMS)

**Status:** early public release candidate. The initial version was reported working by its first user. This is a community workaround for Reddit's changing interface, not an official Reddit product. See [testing status](TEST-RESULTS.md).

## Install

1. Download the ZIP linked above and unzip it. If using **Code → Download ZIP**, unzip the source archive instead.
2. Keep the extracted folder somewhere permanent: Chrome loads the files from that folder.
3. Enter `chrome://extensions` in Chrome's address bar.
4. Turn on **Developer mode** at the top right.
5. Click **Load unpacked** and select the folder containing `manifest.json`.
6. Refresh any Reddit tabs already open.

There is no Chrome Web Store listing yet. Chrome's unpacked-extension workflow is documented [here](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

### Updating or removing it

To update, replace the files in the installed folder, click **Reload** on the extension's card at `chrome://extensions`, and refresh Reddit. Updates are manual.

To disable or uninstall, use the extension's card at `chrome://extensions`.

## What it targets

- App-install modal dialogs and bottom sheets with the supported English headline and an app action button.
- Prompts inserted after the page loads or reinserted during navigation.
- Prompts inside open shadow roots, including components whose shadow root appears later.
- Scroll locks left by a removed prompt.

It checks for an app promotion before removing a container, avoids removing posts and feeds, and avoids releasing the page lock while another recognized dialog is open. It is not a general ad blocker.

## Privacy and permissions

The extension consists of `manifest.json` and `content.js`. You can inspect both before installing.

- Runs only on the explicitly listed Reddit hosts.
- Makes no network requests and loads no remote code.
- Collects, transmits, and stores no browsing data, cookies, or credentials.
- Has no background service worker, analytics, runtime dependencies, or extra extension API permissions.

Chrome may describe its site access as permission to read and change data on Reddit: that access is needed to inspect and remove page elements. See [PRIVACY.md](PRIVACY.md).

## Limitations

Supported text is currently English. Reddit can change its markup or wording; closed shadow roots and separate, unfamiliar backdrops may need additional handling. The extension cannot restore content Reddit's server refuses to deliver. It is currently intended for desktop Chrome; other browsers are unverified.

If something breaks, disable the extension, refresh, and compare the behavior. Open an issue with your browser version, extension version, the prompt wording, and a screenshot with personal information removed. Avoid sharing cookies, credentials, or full page dumps.

## Development

No build step is required for the extension itself. Node.js and Playwright are needed only for development tests.

```sh
npm install --ignore-scripts
npx playwright install chromium
npm run check
npm test
python3 scripts/build.py
```

The browser tests load the actual unpacked extension into a temporary Chromium profile. Reddit page requests are intercepted with local test fixtures; they do not use your Reddit account. The tests follow [Playwright's extension guidance](https://playwright.dev/docs/chrome-extensions). Set `CHROMIUM_PATH` to use a compatible installed Chromium instead of Playwright's bundled binary.

`scripts/build.py` makes an extension ZIP containing only the installable files, license, privacy notice, and installation guide, plus `SHA256SUMS`. Development files stay out of the install ZIP.

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for scope and [PUBLISHING.md](PUBLISHING.md) for the release checklist.

GitHub Actions is configured to run the source checks and browser fixture suite on pushes and pull requests. Its first job failed before test execution, so browser results remain unverified; see [testing status](TEST-RESULTS.md). After checks pass on `main`, a new manifest version is packaged on GitHub Releases as a pre-release. The direct download above is available independently. Existing releases are never overwritten. The workflow can also be started manually from the Actions tab.

## License

[MIT](LICENSE). Not affiliated with or endorsed by Reddit.
