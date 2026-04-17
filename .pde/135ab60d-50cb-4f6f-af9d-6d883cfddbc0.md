# Prompt Decomposition

> Engine: **claude**

## Four Directions

### 🌅 EAST — Vision

- Define desired TUI layout: one row vs two rows for presence/fleet info [80%] _(implicit)_
- Clarify value threshold: what information is worth showing in the status area [75%] _(implicit)_

### 🔥 SOUTH — Analysis

- Identify which widget files are already changed via git status/diff [95%] _(implicit)_
- Locate Anti-Helpful Helper and fleet status rendering in ava-presence widget [90%]
- Assess how many terminal rows current presence widget occupies [88%]

### 🌊 WEST — Validation

- Verify commit only includes already-changed widget files, not unrelated changes [95%]
- Confirm issue ID is correctly referenced in commit message [97%]
- Validate optimized widget still renders correctly after row reduction [80%] _(implicit)_

### ❄️ NORTH — Action

- Create GitHub issue with scope: TUI space optimization for Ava presence widgets [95%]
- Stage and commit only already-changed widget files with issue ID in message [95%]
- Implement optimization: collapse Anti-Helpful Helper + fleet status to single row or remove low-value display [82%]

## Original Prompt

> Create a GitHub issue for the Ava widget/TUI space optimization work, commit only the widget files already changed with the issue ID in the commit message, then investigate and optimize the remaining Ava Presence lines 'Anti-Helpful Helper │ professional' and fleet status that consume two rows of terminal space without much value.

## Primary Intent

**Action:** create
**Target:** GitHub issue for Ava widget/TUI space optimization
**Urgency:** immediate
**Confidence:** 95%

## Secondary Intents

1. **commit** — already-changed widget files _(explicit)_
   - depends on: GitHub issue created (need issue ID)
2. **investigate** — Ava Presence lines consuming two rows (Anti-Helpful Helper + fleet status) _(explicit)_
   - depends on: commit completed
3. **optimize** — Anti-Helpful Helper │ professional line and fleet status row _(implicit)_
   - depends on: investigation complete
4. **identify** — which widget files have already been changed _(implicit)_
5. **include** — issue ID in commit message _(explicit)_
   - depends on: GitHub issue created

## Context Requirements

### Files Needed
- packages/widgets/src/ava-presence/index.tsx
- packages/widgets/src/ava-ceremony/index.tsx
- packages/widgets/src/ava-echo/index.tsx
- packages/widgets/src/ava-interceptor/index.tsx
- packages/widgets/src/ava-tools/index.tsx
- packages/widgets/src/types.ts

### Tools Required
- git diff --name-only
- git status
- gh issue create
- git add (specific files only)
- git commit

### Assumptions
- Some widget files have already been modified and are staged or unstaged
- The GitHub issue does not yet exist
- The Anti-Helpful Helper line and fleet status are rendered by ava-presence widget
- Two rows is considered too much vertical space for this information
- The optimization direction (collapse to one row, remove, or condense) is unspecified

## Expected Outputs

### Updates
- packages/widgets/src/ava-presence/index.tsx (optimization target)
- possibly packages/widgets/src/types.ts

### Communications
- GitHub issue: avadisabelle/ava-pi — Ava widget/TUI space optimization
- git commit referencing issue ID

## Action Stack

- [ ] Run git status and git diff to identify already-changed widget files
- [ ] Create GitHub issue: Ava widget/TUI space optimization (Anti-Helpful Helper + fleet row reduction)
- [ ] Stage only already-changed widget files (never git add -A) (depends on: GitHub issue created)
- [ ] Commit with message referencing issue ID (depends on: files staged)
- [ ] Locate Anti-Helpful Helper and fleet status rendering in ava-presence source (depends on: commit completed)
- [ ] Assess row consumption and determine optimization strategy (collapse/remove/condense) (depends on: source located)
- [ ] Implement TUI space optimization in ava-presence widget (depends on: strategy determined)
- [ ] Verify rendering after optimization (depends on: optimization implemented)

## Ambiguity Flags

- **"Optimization direction unspecified: collapse two rows into one, remove entirely, or make conditional?"**
  - Suggestion: Specify whether Anti-Helpful Helper and fleet lines should be merged into one row, hidden by default, or removed
- **"'without much value' is subjective — unclear if both lines should be removed or just condensed"**
  - Suggestion: Confirm whether fleet status (💜 ○ 🏗️ ○ 🌸) has any retained value or should be dropped entirely
- **"'already changed' widget files — exact set unknown until git status is run"**
  - Suggestion: Run git status first to confirm which files qualify before committing
