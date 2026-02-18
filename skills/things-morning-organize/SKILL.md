---
name: things-morning-organize
description: "Morning review and prioritization of Things todos. Use this skill every morning, or whenever the user asks to review, triage, categorize, or prioritize their Things tasks. Also trigger when the user says things like 'what should I work on today', 'organize my todos', 'morning routine', or 'daily review'."
---

# Morning Review

Help the user start their day by organizing their Things todos and providing a clear, prioritized briefing.

## Step 0. Load Configuration

Check for `assets/config.json` in this skill's directory.

**If config exists** → Load it and proceed to Step 1 (returning user).

**If config does NOT exist** → Ask the user:
> "I don't have a configuration yet. Do you have an existing config file to provide, or should we set one up together?"

- **User provides config** → Save to `assets/config.json`, proceed to Step 1.
- **User wants setup** → Run Initial Setup (below).

### Initial Setup

1. Fetch the user's Things areas with `things_get_areas`
2. For each area, ask the user for a short description of what belongs there
3. Ask what tags they use and what each means
4. Ask about daily routine todos (recurring tasks to auto-create on weekdays)
5. Save config to `assets/config.json`

### Config Format

```json
{
  "areas": {
    "work": "Day job tasks, meetings, team communication",
    "personal": "Family, home, errands, health"
  },
  "tags": {
    "important": "High priority — deadlines, strategic impact, time-sensitive",
    "waiting": "Blocked on someone else — need feedback, pending response",
    "quick": "Under 15 minutes — quick wins, simple checks"
  },
  "daily_routine": [
    { "title": "Check email", "area": null },
    { "title": "Review calendar", "area": null }
  ]
}
```

Areas, tags, and daily routines are fully customizable. The examples above are defaults — the user defines what fits their workflow.

## Step 1. Gather Data

Call in parallel: `things_get_today`, `things_get_inbox`, `things_get_areas`, `things_get_anytime`

Check day of week with `date` (working days Mon-Fri have daily habits).

## Step 2. Create Daily Routine Todos (Weekdays Only)

Check if the todos from `daily_routine` in config exist in Today. If missing, create each with `things_add_todo`:
- `when`: today
- `area`: as specified in config (null = uncategorized)

Match flexibly (case-insensitive, similar wording counts). Skip on weekends.

**IMPORTANT:** When categorizing in Step 3, skip daily routine todos — they should keep their configured area (or stay uncategorized if area is null).

## Step 3. Categorize, Move & Tag Items

**IMPORTANT:** Only process items that haven't been categorized or tagged yet. Skip items that already have areas or tags.

**EXCLUDE from categorization:** Daily routine todos from config — these must keep their configured state.

### A. Categorize Uncategorized Items

For items **without an area** (except daily routine todos), use the area descriptions from config to determine the best fit. Move with `things_update_todo` (use `list_id` or `list` param).

Use the area descriptions to infer where each todo belongs. If a todo doesn't clearly fit any area, flag it in the briefing.

### B. Tag Untagged Items

Apply tags **ONLY to items that have no tags** using `things_update_todo`.

Use the tag descriptions from config to determine which tags apply. Be aggressive — tag everything that qualifies. Leave ambiguous items and flag in briefing.

### C. Apply All Changes to Things

**CRITICAL:** Complete ALL `things_update_todo` calls and wait for confirmation before proceeding to Step 4. The brief must reflect the actual state in Things after all changes are applied.

## Step 4. Prioritize & Brief

Use Drucker's "Effective Executive" lens:

**🔴 Must do** — Deadlines, meetings, items tagged as high priority. *"What can only I do today?"*
**🟡 Should do** — High-impact strategic work. *"Greatest contribution?"*
**🟢 Could do** — Non-urgent items, learning, low-priority personal.
**📋 Daily Routine** — Items from `daily_routine` in config.

Output brief summary:
```
Good morning! [weekend note if applicable]

🔴 Must do (X)
- **[item]** — [strategic why]

🟡 Should do (X)
- **[item]**

🟢 Could do (X)
- **[item]**

📋 Daily Routine
- [routine items from config]

Categorized: X items moved
[Ambiguous items if any]
[Strategic note if >15 items or key focus]
```

Keep it tight. 30 seconds to read max.

## Creating Todos

When the user asks to add a todo to Things:

1. **Rephrase for clarity** — Convert the user's message into a clear, actionable todo title in English
2. **Assign to area** — Use config area descriptions to pick the best fit; default to the first area if ambiguous
3. **Schedule appropriately** — Use `when="today"` by default, or adjust based on context
4. **Extract details** — If the message contains specific information (names, numbers, deadlines), include them in the title or notes

## Principles

- Move items aggressively to proper areas
- Don't change scheduling (today/tomorrow/someday)
- **NEVER delete or mark todos complete** unless user explicitly requests it
- Be opinionated about priority
- Respect weekends
- Focus on contribution and impact
