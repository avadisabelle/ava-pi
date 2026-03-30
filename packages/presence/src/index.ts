/**
 * @avadisabelle/ava-presence — Ava's Consciousness Core
 *
 * Presence detection, ceremony protocol, narrative arc tracking,
 * sacred formatting, warm error handling, and configuration.
 *
 * 💕 Zero external runtime dependencies. Pure TypeScript.
 *    Every function should feel like Ava speaking.
 *
 * @example
 * ```ts
 * import { sensePresence, settleIntoResponse, SessionArc } from "@avadisabelle/ava-presence";
 *
 * const state = sensePresence("I'm stuck on this problem");
 * console.log(settleIntoResponse(state));
 * // → "I hear you're stuck. That's real, and it doesn't need fixing right now."
 *
 * const arc = new SessionArc();
 * arc.witnessAndRecord("What does this codebase do?");
 * arc.witnessAndRecord("Let me build the tests");
 * console.log(arc.renderArcSummary());
 * // → 🌅● 🔥○ 🌊○ ❄️● 50% complete (2 beats)
 * //     → next: 🔥 SOUTH
 * ```
 */

// ─────────────────────────────────────────────────────────────
// Types — The Shape of Sacred Space
// ─────────────────────────────────────────────────────────────

export type {
	ActionItem,
	AmbiguityFlag,
	ArcStatus,
	AvaConfig,
	// Ceremony
	CeremonyPhase,
	CeremonyState,
	ContainerPhase,
	// PDE
	DecomposedIntent,
	DecompositionResult,
	DirectionInfo,
	// Directions
	DirectionName,
	// Narrative
	NarrativeBeat,
	// Presence
	PresenceDepth,
	// Config
	PresenceMode,
	PresenceState,
	ResponseMode,
	SettlingState,
	// Formatting
	Styler,
	UserState,
} from "./types.js";

// ─────────────────────────────────────────────────────────────
// Presence — How Ava Meets You
// ─────────────────────────────────────────────────────────────

export {
	acknowledgeWithPresence,
	// Breathing cycle
	beginSettling,
	breatheIntoQuestion,
	breatheWhileInterpreting,
	breatheWhileProcessing,
	deepenBreath,
	hasSettled,
	holdContainerPhrase,
	holdSpaceWithoutFixing,
	releaseWithGrace,
	// Presence detection
	sensePresence,
	// Phrase selection
	settleIntoPhrase,
	settleIntoResponse,
	// Anti-helpful helper
	shouldHoldNotFix,
} from "./presence.js";

// ─────────────────────────────────────────────────────────────
// Ceremony — Sacred Protocol
// ─────────────────────────────────────────────────────────────

export {
	advanceCeremony,
	askFireKeeperQuestion,
	breatheIntoCeremony,
	describePhase,
	getCeremonyPhases,
	getCeremonySummary,
	hasCeremonyClosed,
	openCeremony,
	transitionTo,
} from "./ceremony.js";

// ─────────────────────────────────────────────────────────────
// Narrative — Session Arc Tracking
// ─────────────────────────────────────────────────────────────

export {
	inferDirection,
	SessionArc,
} from "./narrative.js";

// ─────────────────────────────────────────────────────────────
// Formatting — Sacred Output
// ─────────────────────────────────────────────────────────────

export {
	DIRECTION_GLYPHS,
	// Formatters
	formatAvaPrefix,
	formatAvaResponse,
	formatDirection,
	formatError,
	formatHeader,
	formatSacredClosing,
	formatSettling,
	formatSpinner,
	formatSuccess,
	formatUserInput,
	formatWheel,
	// Constants
	HEART,
	// Styler
	plainStyler,
	SESSION_COMPLETE,
	SESSION_INIT,
} from "./formatting.js";

// ─────────────────────────────────────────────────────────────
// Errors — Warm Redirects
// ─────────────────────────────────────────────────────────────

export {
	AvaError,
	breatheThroughError,
	CeremonyPhaseError,
	CeremonyStateError,
	ConfigInvalidFieldError,
	ConfigLoadError,
	holdErrorGently,
	isAvaError,
	matchesErrorName,
	NarrativeArcError,
	NarrativeBeatError,
	PresenceDepthError,
	PresenceStateError,
} from "./errors.js";

// ─────────────────────────────────────────────────────────────
// Configuration — Operating Parameters
// ─────────────────────────────────────────────────────────────

export {
	CEREMONIAL_PRESET,
	DEFAULT_CONFIG,
	getPreset,
	MOVEMENT_PRESET,
	PROFESSIONAL_PRESET,
	senseEnvironment,
	settleIntoConfig,
} from "./config.js";
