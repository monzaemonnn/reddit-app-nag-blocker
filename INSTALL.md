# Install Reddit App Nag Blocker

1. Unzip the downloaded extension archive.
2. Move the `reddit-app-nag-blocker` folder somewhere permanent. Keep it there while installed.
3. Enter `chrome://extensions` in Chrome's address bar.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the folder containing `manifest.json`.
6. Refresh your Reddit tabs.

The extension runs automatically. It targets supported English app-install overlays and their page scroll locks. It makes no external requests and collects no data. Inspect `content.js` and `manifest.json` if you want to review its behavior.

This is an early community release, not an official Reddit product. Reddit may change the prompt. Other languages, unfamiliar backdrops, and closed shadow roots are not guaranteed to work.

To update: replace the installed folder's contents with a newer version, click **Reload** on its extension card, then refresh Reddit.

To disable or remove: use the extension's card at `chrome://extensions`. If a page behaves incorrectly, disable the extension and refresh it.
