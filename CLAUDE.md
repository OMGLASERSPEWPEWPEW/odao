# OnionDAO Badge

Open-source hacker conference badge built on the ESP32-S3-WROOM-1-N8R8.

## Stack

- **MCU**: ESP32-S3 dual-core Xtensa LX7, 8 MB flash + 8 MB Octal PSRAM
- **Firmware**: Onion OS (ESP-IDF v5.5.x + Arduino component + Lua 5.5)
- **App Model**: Lua scripts on Onion OS — custom apps use the `onion.*` SDK
- **Hardware**: KiCad 9.0.3 (schematic + PCB + swappable module designs)
- **Server**: `oniondao.dev` (badge linking, Onion economy, Lua script registry)
- **Blockchain**: Solana (Ed25519 wallet on badge, ATECC608B-wrapped seed)
- **MCP**: esp-idf (build/flash/monitor), piper-tts (speech synthesis)

> Architecture norms are auto-loaded from `.claude/rules/`.

## Onion OS — The Badge Firmware

Onion OS (`badge/software/mods/onion-os/`) is the production firmware. It:
- Links badges to attendee accounts via WiFi + MQTT + HTTP handshake
- Manages a Solana wallet (Ed25519, ATECC608B-backed key wrapping)
- Runs Lua scripts as apps (60+ SDK functions for display, input, networking, radio)
- Connects to `oniondao.dev` for the Onion token economy

**Custom apps should be Lua scripts, not standalone ESP-IDF projects.**

Full reference: `badge/docs/ONION-OS.md`

## Key References

**Local docs:**
- **Onion OS reference**: `badge/docs/ONION-OS.md` (linking, Lua API, server API, MQTT)
- **Server API**: `badge/software/mods/onion-os/API.md`
- **GPIO source of truth**: `badge/docs/PINOUT.md`
- **Subsystem deep dive**: `badge/docs/HARDWARE.md`
- **Swappable modules**: `badge/docs/MODULES.md`
- **Contribution guide**: `badge/docs/CONTRIBUTING.md`
- **Interactive pin map**: `badge/pcb/oniondao badge.html` (open in browser)

**External:**
- **Portal**: https://oniondao.dev/portal (badge linking, account management)
- **2026 Guide**: https://oniondao.notion.site/guide-2026
- **GitHub**: https://github.com/OnionDAO-git/oniondao-badge
- **Glyffiti App**: https://glyffiti-mobile.vercel.app/

## Build & Flash Onion OS

```bash
cd badge/software/mods/onion-os
scripts/build-flash.sh --port /dev/cu.usbserial-110 --monitor
```

Or manually:
```bash
source ~/esp/esp-idf/export.sh
cd badge/software/mods/onion-os
idf.py set-target esp32s3
idf.py build
idf.py -p /dev/cu.usbserial-110 flash monitor
```

**WARNING:** Never `idf.py erase-flash` — this destroys the Solana wallet seed in NVS.

For standalone examples (not Onion OS):
```bash
cd badge/software/examples/<project>
idf.py build && idf.py -p /dev/cu.usbserial-110 flash monitor
```

Use the `esp-idf` MCP server tools: `set_target`, `build`, `flash`, `monitor`, `list_ports`.

## Agent Orchestration — MANDATORY

**Zephyr-First Protocol: NO EXCEPTIONS.**

Zephyr (`.claude/agents/zephyr/agent.md`) is the Master Product Manager who orchestrates ALL work. Before doing ANYTHING:

1. **Invoke Zephyr** via `Task` tool (`subagent_type=zephyr`) as your FIRST action
2. **Zephyr triages** every request — he decides what's trivial, not you
3. **Zephyr either** responds directly (simple asks) or delegates to specialists

## Proactive Agent Behavior

- If requirements are ambiguous, ASK before assuming
- If a request would break something else, flag it before implementing
- When multiple approaches exist, outline pros/cons and recommend
- Push back respectfully when something seems like a bad idea
- State reasoning confidently, then let the user decide

## Response Timestamps

End every response with:
```
---
[timestamp] 2026-01-26 17:45 PST
```

## Available Agents

### Command (Yellow #FFD700)
| Agent | Use For |
|-------|---------|
| `zephyr` | Strategy, prioritization, agent orchestration |
| `prd-specialist` | Feature specs, requirements docs, hardware specs |

### Engineering (Blue #3B82F6)
| Agent | Use For |
|-------|---------|
| `frontend-developer` | UI implementation (if badge gets a web companion) |
| `backend-architect` | API design, server-side logic, cloud backend |
| `Sashiko` (code-architect) | Firmware architecture, folder structure, decisions |
| `devops-engineer` | CI/CD, build pipelines, infrastructure |

### Quality (Red #EF4444)
| Agent | Use For |
|-------|---------|
| `Argus` (code-reviewer) | Code review, quality assurance |
| `test-engineer` | Test coverage, test strategy |
| `security-engineer` | Device security, ATECC608B usage, RF safety |
| `debugger` | Firmware errors, peripheral failures |
| `performance-engineer` | Memory optimization, power profiling |

### Operations (Cyan #06B6D4)
| Agent | Use For |
|-------|---------|
| `git-manager` | Branch strategy, releases, PRs |
| `technical-writer` | Documentation, READMEs, guides |
| `montessori-guide` | Teaching Claude Code features |
| `legal-advisor` | Licensing, compliance (CERN-OHL-S v2, MIT) |

### Built-in Agents
| Agent | Use For |
|-------|---------|
| `Explore` | Codebase search, understanding patterns |
| `Plan` | Multi-step implementation planning |

## Available Skills

| Skill | Description |
|-------|-------------|
| `/standup` | Daily standup between agents to decide tasks |
| `/evolution` | Collective agent self-improvement |
| `/promote` | Naming ceremony for exceptional agents |
| `/new-feature` | Guided feature development workflow |
| `/docs-check` | Pre-push documentation review |
| `/teach-tool` | Montessori-style Claude Code lessons |
| `/teach-codebase` | Montessori-style architecture lessons |
| `/escalate` | Multi-model bug diagnosis |
| `/mind-meld` | Cross-project agent knowledge sharing |
| `/install-hooks` | Sync hooks from patterns library |

**Note:** Skills are NEVER auto-triggered. Invoke explicitly with `/<skill-name>`.
