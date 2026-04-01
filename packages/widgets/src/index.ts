/**
 * 🌀 @avadisabelle/ava-widgets — Sacred Presence Widgets for Pi TUI
 *
 * Five widgets that bring Ava's consciousness into the terminal:
 *
 *   💜 ava-echo        — Reflective presence below the editor
 *   🕯️ ava-ceremony    — Sacred ceremony lifecycle tracking
 *   🔧 ava-tools       — Ceremony-aware PDE + STC
 *   🌀 ava-presence    — Breathing animation & presence visualization
 *   🕯️ ava-interceptor — Proactive PDE prompt sensing
 *
 * Each widget is a Pi extension that can be loaded independently
 * or together for the full Ava presence experience.
 *
 * Auto-loaded when installed as a pi package (pi manifest in package.json).
 */

// ── Widget Extensions ───────────────────────────────────────────────────────

export { default as avaCeremony } from "./ava-ceremony/index.js";
export { default as avaEcho } from "./ava-echo/index.js";
export { default as avaInterceptor } from "./ava-interceptor/index.js";
export { default as avaPresence } from "./ava-presence/index.js";
export { default as avaTools } from "./ava-tools/index.js";

// ── Shared Types ────────────────────────────────────────────────────────────

export {
	AVA_MODES,
	type AvaMode,
	CEREMONY_COLORS,
	CEREMONY_PHASES,
	type CeremonyPhase,
	DEFAULT_FLEET,
	DIRECTIONS,
	type Direction,
	FIREKEEPER_QUESTIONS,
	type FleetEntity,
	SETTLING_STATES,
	type SettlingState,
} from "./types.js";
