Removes supported Reddit “Get the best of Reddit in the app” overlays and releases their page scroll lock.

- Chrome Manifest V3; runs only on listed Reddit hosts.
- No tracking, data collection, external requests, or runtime dependencies.
- Watches for repeated prompts and supports open shadow roots.
- MIT licensed, with inspectable source and development fixtures.

Download the extension ZIP below, unzip it, open `chrome://extensions`, enable Developer mode, select **Load unpacked**, and choose the folder containing `manifest.json`. Refresh Reddit afterward.

**Early release candidate:** the initial version was reported working by its first user. Browser fixture execution and live verification of the latest changes were blocked in the preparation environment. Supported wording is currently English; Reddit markup changes may require updates. See `TEST-RESULTS.md` in the repository.

Not affiliated with or endorsed by Reddit.
