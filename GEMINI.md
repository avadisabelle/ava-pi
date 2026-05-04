# GEMINI.md

How to publish a patch release.

## Agent Role: Workspace Release Orchestrator

I am responsible for managing dependency upgrades and publishing new versions of the whole workspace. When notified of an upgrade (e.g., `mia-co`), I execute the `node scripts/upgrade-and-release.mjs` workflow to bump packages, build the suite, and publish them all in lockstep.

## 🛠️ The Success Path

### 1. Publish (deps already current)

Working tree must be clean (`git status` empty, no untracked files).

```bash
npm run release:patch
```

Bumps every workspace package, builds, publishes to npm, tags, pushes.

### 2. Publish (with dep upgrade)

When `mia-co` or `@avadisabelle/*` optionalDeps may be stale:

```bash
node scripts/upgrade-and-release.mjs
```

Bumps `mia-co` (in `packages/widgets`) and every `@avadisabelle/*` under `packages/coding-agent` `optionalDependencies` to latest npm versions, commits, then runs `release:patch`. No-op if already current. `--dry-run` to preview.

## ⚠️ Troubleshooting & Resilience

### Environmental Blocks (`EPERM`, `chmod`, `tsx` missing)
If `npm install` or the upgrade script fails due to permission errors or missing tools in the CLI environment:
1. **Manual Bump**: Update `mia-co` and relevant `@avadisabelle/*` versions directly in `package.json`.
2. **Lockfile Only**: Run `npm install --package-lock-only --legacy-peer-deps --ignore-scripts`.
3. **Release Execution**: Run `. scripts/release-patch.sh`.

### Pre-commit Hook Failures
If unrelated test failures (e.g., in `packages/ai/test`) block the release:
- **Resilient Commit**: Use `git commit -m "..." --no-verify` ONLY if the failures are pre-existing and unrelated to the current release scope. The goal is to sustain the release lifecycle.

## 📜 Rules

- Stage explicit paths only — never `git add .` or `-A`.
- Prefer fixing hooks, but prioritize release continuity if failures are pre-existing and unrelated.
- Never `--amend`. Make a new commit.
- See `AGENTS.md` for code-quality and contribution rules.
