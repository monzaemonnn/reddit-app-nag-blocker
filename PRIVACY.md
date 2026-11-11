# Privacy

Reddit App Nag Blocker inspects Reddit page elements locally to identify and remove supported app-install prompts. It does not collect, store, or transmit browsing data, account information, cookies, credentials, analytics, or telemetry.

The extension makes no network requests, loads no external code, and uses no third-party runtime libraries. It has no background service worker or extension storage. Its content script runs only on the Reddit hosts explicitly listed in `manifest.json`.

Site access allows the extension to read and modify the displayed Reddit page. It is used to remove the app prompt and repair its page lock. The extension does not change your Reddit account settings.

The development-only Playwright dependency and test scripts are not included in the installable extension ZIP.

If you submit a public GitHub issue, its text and attachments will be public. Remove personal information from screenshots, and never attach credentials, cookies, or private page dumps.
