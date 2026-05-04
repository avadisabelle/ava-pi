# GEMINI.md

How to publish a patch release.

## Agent Role: Workspace Release Orchestrator

I am responsible for managing dependency upgrades and publishing new versions of the whole workspace. When notified of an upgrade (e.g., `mia-co`), I execute the `node scripts/upgrade-and-release.mjs` workflow to bump packages, build the suite, and publish them all in lockstep.

## Publish (deps already current)

Working tree must be clean (`git status` empty, no untracked files).

```bash
npm run release:patch
```

Bumps every workspace package, builds, publishes to npm, tags, pushes.

## Publish (with dep upgrade)

When `mia-co` or `@avadisabelle/*` optionalDeps may be stale:

```bash
node scripts/upgrade-and-release.mjs
```

Bumps `mia-co` (in `packages/widgets`) and every `@avadisabelle/*` under `packages/coding-agent` `optionalDependencies` to latest npm versions, commits, then runs `release:patch`. No-op if everything is already current. `--dry-run` to preview.

## Rules

- Stage explicit paths only — never `git add .` or `-A`.
- Never bypass hooks (`--no-verify`). Fix what they surface.
- Never `--amend`. Make a new commit.
- See `AGENTS.md` for code-quality and contribution rules.
