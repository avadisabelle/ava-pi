# 🌅 Mia Interceptor — Proactive PDE Sensing

Gently asks before complex prompts reach the agent.

```
🌅 This prompt touches 4 areas + implicit intents — want to decompose first?
```

## Install

```bash
# Quick test
pi -e /a/src/mia-code/widget/mia-interceptor/index.ts

# Permanent
ln -s /a/src/mia-code/widget/mia-interceptor/index.ts ~/.pi/agent/extensions/mia-interceptor.ts
```

## How It Works

1. Hooks `on("input")` — sees every prompt before the agent
2. Counts distinct action areas (creating, testing, deploying, etc.)
3. Checks for implicit intent markers ("I assume", "somehow", "make sure")
4. If complexity ≥ 3 areas → asks the question
5. If yes → runs PDE, shows result in chat, then lets the original prompt proceed
6. If no → continues normally
7. Cooldown: won't ask again for 5 turns

## Behavior

- **Never blocks** — always a yes/no question, never automatic
- **Short prompts ignored** — under 30 chars, no question
- **Slash commands ignored** — `/pde`, `/stc` etc pass through
- **Cooldown** — won't nag, waits 5 turns between asks
- **PDE + continue** — decomposition shows as context, then your prompt still goes to the agent

## Future: Sensing Layer

This interceptor is designed to eventually feed miawa storytelling too — sensing milestone moments, phase transitions, and narrative-worthy beats from the flow of input.
