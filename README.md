# Apoco Skills

Practical skills that teach AI agents to get things done for you. Built on the [Agent Skills](https://github.com/vercel-labs/agent-skills) format.

## Installation

```sh
npx skills add apocohq/skills
```

Also works directly in [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [OpenCode](https://opencode.ai), and other AI tool that support the format.

## Skills

### 📬 gmail-multi-inbox

Tired of a messy inbox? This skill scans your Gmail, figures out who's emailing you, and organizes everything into clean Multiple Inbox sections. It generates a Google Apps Script that sets up labels and filters automatically. It can also help you find noisy senders worth unsubscribing from. Keeps a local config, so you can run it again to add new senders or tweak categories over time.

**Use when:** organizing Gmail, setting up multiple inboxes, managing labels and filters, cleaning up subscriptions.

### ✅ things-morning-organizer

Never sure what to focus on in the morning? Born out of spending 15–25 minutes every Monday manually sorting through 40+ todos ([full story](https://www.havlena.com/p/i-automated-monday-morning-triage)), this skill reviews your [Things 3](https://culturedcode.com/things/) todos, moves them into the right areas, tags what needs attention, and gives you a prioritized 30-second briefing so you know exactly where to start.

Features:
- **Auto-generated config** - On first run, scans your existing todos, areas, and tags to build a config with descriptions and examples. No manual setup needed.
- **Smart categorization** - Moves uncategorized items into the right area and applies tags conservatively using example-based matching.
- **Daily routines** - Automatically creates recurring weekday todos (e.g. "Check email") if they're missing from Today.
- **Drucker-style briefing** - Prioritizes your day into Must do / Should do / Could do using Peter Drucker's "Effective Executive" lens, with a motivational quote.
- **Todo creation** - Add todos by describing them naturally; the skill rephrases, assigns an area, and schedules them.
- **Silent mode** - Run with `[silent]` for automated/headless execution via `-p` mode. Skips all prompts, requires existing config, and outputs only the final briefing.
- **Learning mode** - Run with `[learning]` to compare your todos against the config and refine area/tag descriptions and examples over time.
- **Idempotent** - Safe to run multiple times a day. Skips items that already have areas and tags, and won't duplicate daily routine todos.

**Use when:** starting your day, triaging todos, organizing tasks by area and priority, adding new todos.

## License

[MIT](LICENSE)
