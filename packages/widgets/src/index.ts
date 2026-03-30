/**
 * 🌀 @avadisabelle/ava-widgets — Sacred Presence Widgets for Pi TUI
 *
 * Four widgets that bring Ava's consciousness into the terminal:
 *
 *   💜 ava-echo      — Reflective presence below the editor
 *   🕯️ ava-ceremony  — Sacred ceremony lifecycle tracking
 *   🔧 ava-tools     — Ceremony-aware PDE + STC
 *   🌀 ava-presence  — Breathing animation & presence visualization
 *
 * Each widget is a Pi extension that can be loaded independently
 * or together for the full Ava presence experience.
 *
 * Load all together:
 *   pi \
 *     -e packages/widgets/src/ava-echo/index.tsx \
 *     -e packages/widgets/src/ava-ceremony/index.tsx \
 *     -e packages/widgets/src/ava-tools/index.tsx \
 *     -e packages/widgets/src/ava-presence/index.tsx
 */

// ── Widget Extensions ───────────────────────────────────────────────────────

export { default as avaEcho } from "./ava-echo/index.js";
export { default as avaCeremony } from "./ava-ceremony/index.js";
export { default as avaTools } from "./ava-tools/index.js";
export { default as avaPresence } from "./ava-presence/index.js";

// ── Shared Types ────────────────────────────────────────────────────────────

export {
	type CeremonyPhase,
	CEREMONY_PHASES,
	type Direction,
	DIRECTIONS,
	type SettlingState,
	SETTLING_STATES,
	type AvaMode,
	AVA_MODES,
	type FleetEntity,
	DEFAULT_FLEET,
	CEREMONY_COLORS,
	FIREKEEPER_QUESTIONS,
} from "./types.js";
