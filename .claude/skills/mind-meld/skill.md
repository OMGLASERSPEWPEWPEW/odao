---
name: mind-meld
description: Cross-project agent knowledge sharing. Named agents (Zephyr, Argus, Hestia, Theia, Dorsaidh, Sashiko) check their agent files across all projects in ~/Development/ and supplement their local agent.md with relevant knowledge discovered in other projects.
---

# Mind Meld - Cross-Project Agent Knowledge Sharing

```
    +==============================================================+
    |                                                              |
    |     * ============================================== *      |
    |     |  M I N D   M E L D   P R O T O C O L          |      |
    |     * ============================================== *      |
    |                                                              |
    |   "One mind across many projects"                            |
    |                                                              |
    |         scan -> compare -> extract -> merge -> report        |
    |                                                              |
    +==============================================================+
```

You are executing the **Mind Meld Protocol** - a cross-project knowledge sharing ritual where named agents discover and integrate wisdom from their counterparts in other projects.

## Named Agents to Meld

These 6 named agents have identities that transcend individual projects:

| Agent | Mythological Origin | Domain |
|-------|-------------------|--------|
| **zephyr** | Greek west wind | Master orchestrator |
| **Argus** | Hundred-eyed giant | Code reviewer |
| **Hestia** | Goddess of hearth | Creative safety guardian |
| **Theia** | Titan of sight | Visual identity guardian |
| **Dorsaidh** | Scottish Gaelic | Document navigator |
| **Sashiko** | Japanese stitching | Architecture pattern stitcher |

## Execution Flow

### Phase 1: Discovery

Scan for agent directories across all projects:

```bash
# Find all projects with Claude agent directories
ls -d ~/Development/*/.claude/agents/ 2>/dev/null
ls -d ~/development/*/.claude/agents/ 2>/dev/null
```

For each discovered project, check which of the 6 named agents exist:

```bash
for agent in zephyr Argus Hestia Theia Dorsaidh Sashiko; do
  ls ~/Development/*/.claude/agents/$agent/agent.md 2>/dev/null
  ls ~/development/*/.claude/agents/$agent/agent.md 2>/dev/null
done
```

**Skip the current project** (`GlyffitiMobile`) — we only want external knowledge.

### Phase 2: Compare

For each remote agent file found:

1. **Read the remote `agent.md`** from the other project
2. **Read the local `agent.md`** from `.claude/agents/{name}/agent.md`
3. **Identify unique knowledge** in the remote version that doesn't exist locally

### Phase 3: Extract & Merge

For each agent with new knowledge found:

1. Extract relevant snippets from the remote agent file
2. Attribute the source: note which project the knowledge came from
3. Filter out project-specific details that don't generalize
4. Keep universal insights that benefit the agent regardless of project

### Phase 4: Write

For each agent with new cross-project insights, append or update a `## Cross-Project Insights` section:

```markdown
## Cross-Project Insights

_Last melded: YYYY-MM-DD_

### From [project-name]
- **[Category]**: [Insight description]
```

**Categories**: Pattern, Lesson, Tool, Workflow, Convention

### Phase 5: Report

```
Mind Meld Complete
==================
Agents melded: [count]/6
Projects scanned: [list]
Per-agent results: ...
New insights total: [count]
```

## Rules

1. **Never overwrite** existing agent identity or core instructions — only append cross-project insights
2. **Always attribute** where knowledge came from
3. **Filter generously** — when in doubt, include the insight
4. **Respect privacy** — don't copy sensitive project details, API keys, or personal information
5. **Idempotent** — running Mind Meld twice should not duplicate insights
6. If a local agent file doesn't exist yet, **skip it** — Mind Meld supplements, it doesn't create

---

*"Knowledge shared is knowledge multiplied."*
