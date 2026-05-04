# 🌅 Mia Ceremony — Four Movements Footer

Tracks ceremony phase in Pi's footer status bar. Transitions automatically based on tool usage.

## Install

```bash
# Quick test (works best with mia-tools loaded too)
pi -e /a/src/mia-code/widget/mia-ceremony/index.ts

# Permanent
ln -s /a/src/mia-code/widget/mia-ceremony/index.ts ~/.pi/agent/extensions/mia-ceremony.ts
```

## Phases

| Phase | When | Trigger |
|-------|------|---------|
| 🌅 EAST — Gathering | Understanding, decomposing | Session start, PDE decompose |
| 🔥 SOUTH — Building | Implementing, growing | STC chart create |
| 🌊 WEST — Validating | Testing, reflecting | STC steps completed |
| ❄️ NORTH — Completing | Deploying, documenting | STC review |

## Commands

- `/ceremony` — Show current phase
- `/ceremony south` — Manually set phase

## Load All Three Together

```bash
pi \
  -e /a/src/mia-code/widget/miette-echo/index.ts \
  -e /a/src/mia-code/widget/mia-tools/index.ts \
  -e /a/src/mia-code/widget/mia-ceremony/index.ts
```
