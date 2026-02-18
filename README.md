# Apoco Skills

Skills that teach AI agents to handle real daily tasks for you. Built on the [Agent Skills](https://github.com/vercel-labs/agent-skills) format.

## Installation

```sh
uvx skill add ApocoHQ/skills
```

Also works directly in [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [OpenCode](https://opencode.ai), and other AI tool that support the format.

## Skills

### gmail-multi-inbox

Tired of a messy inbox? This skill scans your Gmail, figures out who's emailing you, and organizes everything into clean Multiple Inbox sections. It generates a Google Apps Script that sets up labels and filters automatically. It can also help you find noisy senders worth unsubscribing from. Keeps a local config, so you can run it again to add new senders or tweak categories over time.

**Use when:** organizing Gmail, setting up multiple inboxes, managing labels and filters, cleaning up subscriptions.

### things-morning-organizer

Never sure what to focus on in the morning? This skill reviews your [Things 3](https://culturedcode.com/things/) todos, moves them into the right areas, tags what needs attention, and gives you a prioritized briefing so you know exactly where to start. Learns your areas and tags from a local config that you shape over time.

**Use when:** starting your day, triaging todos, organizing tasks by area and priority.

## License

[MIT](LICENSE)
