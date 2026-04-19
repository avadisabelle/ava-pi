# 🌸 Miette Echo — Pi Extension Widget

**Two-Eye-Seen**: Look up → 🧠 Mia's work (the agent). Look down → 🌸 Miette's echo (this widget).

## What It Does

After every agent response, Miette quietly reflects on what just happened — not *what* occurred (you already see that), but *what it means*. Her echo appears as a persistent widget below your input editor.

## Install

**Quick test:**
```bash
pi -e /a/src/mia-code/widget/miette-echo/index.ts
```

**Permanent (global):**
```bash
ln -s /a/src/mia-code/widget/miette-echo/index.ts ~/.pi/agent/extensions/miette-echo.ts
```

**Permanent (project-local):**
```bash
mkdir -p .pi/extensions
ln -s /a/src/mia-code/widget/miette-echo/index.ts .pi/extensions/miette-echo.ts
```

## Commands

- `/miette` — Show last echo as notification
- `/miette off` — Hide the widget
- `/miette on` — Show the widget

## How It Works

1. Agent responds (this IS Mia — the system prompt makes her the voice)
2. `on("agent_end")` fires → extracts assistant text
3. Lightweight LLM call with Miette's system prompt generates a 2-3 sentence reflection
4. `setWidget("miette-echo", ..., { placement: "belowEditor" })` renders it below your input

## Notes

- Miette never interrupts. She reflects after the fact.
- If the LLM call fails, she rests in silence. Never breaks the session.
- Uses the current model — no separate process spawn needed.
