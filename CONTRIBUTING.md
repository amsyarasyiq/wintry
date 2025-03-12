# Contributing to Wintry

Thank you for taking the time to contribute! All contributions must adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## How to Contribute

### Report an Issue

If you encounter a bug, glitch, or any unexpected behavior, please report it by opening an issue. When reporting an issue:

- **Check for duplicates**: Search existing issues to see if the problem has already been reported.
- **Provide a clear title**: A concise summary helps others understand the issue at a glance.
- **Describe the issue in detail**: Include steps to reproduce, expected behavior, and actual behavior.
- **Attach relevant logs or screenshots**: If applicable, provide console output, error messages, or images to clarify the issue.
- **Specify your environment**: Mention your OS, Wintry version, and any other relevant setup details.

### Submit a Contribution

Contributions can be made via pull requests. If you're unfamiliar with Git, check [this guide](https://opensource.com/article/19/7/create-pull-request-github) to learn how to submit a pull request.

#### Write a Plugin

Writing a plugin is the primary way to contribute to Wintry.

Before starting your plugin:
- Check existing pull requests to see if someone is already working on a similar plugin.
- Ensure your plugin adheres to the Plugin Guidelines

#### Plugin Guidelines

- No simple slash command plugins like `/cat`. Instead, make a [user-installable Discord bot](https://discord.com/developers/docs/change-log#userinstallable-apps-preview).
- No simple text replacement plugins like "Let me Google that for you."
- No FakeDeafen, FakeMute or any types of plugins can mislead other users and cause unnecessary confusion or moderation issues. 
- No plugins that interact with specific Discord bots (official Discord apps like YouTube WatchTogether are allowed).
- No selfbots or API spam (e.g., animated status, message pruner, auto-reply, Nitro snipers, etc.).
- No untrusted third-party APIs. Popular services like Google or GitHub are fine, but absolutely no self-hosted ones.
- No plugins requiring users to enter their own API keys.
- Avoid introducing new dependencies unless absolutely necessary.

#### Improve Wintry Itself

If you have ideas for improving Wintry or want to propose a new plugin API, open a feature request to start a discussion.

Found a bug or typo? Feel free to fix it!

---

## Setting Up the Development Environment

To develop Wintry, you need [**Bun**](https://bun.sh/) (v1.2.3+) installed.

1. Install dependencies:
   ```bash
   bun install
   ```
1. Start the development server:
   ```bash
   bun run serve
   ```
   A local development server will start:
   ```
   Serving local development server on:
     http://192.168.0.157:4040/
     http://127.0.0.1:4040/

   Press Ctrl+C to stop the server.
   ```
1. Ensure your client is on the same network and has Wintry installed.
1. Configure Wintry:
   - Navigate to **Settings > Developer (under Wintry section)**.
   - Set **Custom Endpoint** to your server.
   - Make sure to enable **Force Update** and **Automatic Updates** (under **Wintry > Wintry Info**).
1. Reload the Wintry client. If successful, you should see output in the server console:
   ```
   Rebuilding /bundle.96.hbc...
   Bundle compilation took: 626.08ms
   Serving build:
      File: dist/bundle.96.hbc
      Status: fresh-build
      Revision: 7b18e62a91186d7e0e1924bd5d59faf74e205fa9
      Hash: 19a9c0c9ff68f6b386893cfeccaa335d4c85da3f
      Time taken: 1527.01ms
   ```

Now, your client should load the bundle built by the server. You can verify this by checking the revision value in the **About** page.

