# Contributing

Keep changes focused on Reddit app-install prompts. Do not broaden the extension into a general modal remover, authentication bypass, or data collector.

For a bug report, include browser/extension versions, the exact visible prompt wording, and steps to reproduce. A screenshot with personal information removed is helpful. Do not include cookies, tokens, credentials, or full page dumps.

For a code change:

1. Keep the manifest's site scope narrow and avoid additional permissions.
2. Add a small browser fixture for a new prompt variant or a meaningful regression.
3. Verify posts, ordinary dialogs, and scrolling remain usable.
4. Run `npm run check` and `npm test`; state any checks you could not run.
5. Explain the concrete prompt or failure the change addresses.

All contributions are provided under the project's MIT license.
