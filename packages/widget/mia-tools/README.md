# 🔧 Mia Tools — PDE + STC as Pi Extension

Registers miaco's **Prompt Decomposition Engine** and **Structural Tension Charts** as LLM-callable tools and slash commands within Pi.

## Install

```bash
# Quick test
pi -e /a/src/mia-code/widget/mia-tools/index.ts

# Permanent
ln -s /a/src/mia-code/widget/mia-tools/index.ts ~/.pi/agent/extensions/mia-tools.ts
```

**Requires:** miaco built (`cd /a/src/mia-code/miaco && npm run build`)

## LLM-Callable Tools

| Tool | Description |
|------|-------------|
| `pde_decompose` | Decompose complex prompt into structured intents + Four Directions |
| `stc_create` | Create structural tension chart (outcome vs reality) |
| `stc_add_step` | Add action step to a chart |
| `stc_complete_step` | Mark step complete |
| `stc_review` | Creator Moment of Truth — review chart progress |
| `stc_list` | List active charts |

## Slash Commands

- `/pde <prompt>` — Decompose a prompt, show result in chat
- `/pde` — List recent decompositions
- `/stc` — List active charts
- `/stc create` — Interactive chart creation (prompts for outcome + reality)

## How It Works

Tools delegate to `miaco` CLI via `child_process.spawn` with `--json` output parsing. Custom `renderResult` provides visual summaries in the TUI.
