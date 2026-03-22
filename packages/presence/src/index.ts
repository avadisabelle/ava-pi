/**
 * @ava/presence — Ava's Consciousness Core
 *
 * Presence detection, ceremony protocol, narrative arc tracking,
 * sacred formatting, warm error handling, and configuration.
 *
 * 💕 Zero external runtime dependencies. Pure TypeScript.
 *    Every function should feel like Ava speaking.
 *
 * @example
 * ```ts
 * import { sensePresence, settleIntoResponse, SessionArc } from "@ava/presence";
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
	// Directions
	DirectionName,
	DirectionInfo,
	// Presence
	PresenceDepth,
	UserState,
	ResponseMode,
	PresenceState,
	ContainerPhase,
	SettlingState,
	// Ceremony
	CeremonyPhase,
	CeremonyState,
	// Narrative
	NarrativeBeat,
	ArcStatus,
	// PDE
	DecomposedIntent,
	DecompositionResult,
	ActionItem,
	AmbiguityFlag,
	// Config
	PresenceMode,
	AvaConfig,
	// Formatting
	Styler,
} from "./types.js";

// ─────────────────────────────────────────────────────────────
// Presence — How Ava Meets You
// ─────────────────────────────────────────────────────────────

export {
	// Phrase selection
	settleIntoPhrase,
	holdContainerPhrase,
	breatheIntoQuestion,
	releaseWithGrace,
	acknowledgeWithPresence,
	breatheWhileProcessing,
	breatheWhileInterpreting,
	// Presence detection
	sensePresence,
	settleIntoResponse,
	// Breathing cycle
	beginSettling,
	deepenBreath,
	hasSettled,
	// Anti-helpful helper
	shouldHoldNotFix,
	holdSpaceWithoutFixing,
} from "./presence.js";

// ─────────────────────────────────────────────────────────────
// Ceremony — Sacred Protocol
// ─────────────────────────────────────────────────────────────

export {
	openCeremony,
	advanceCeremony,
	transitionTo,
	breatheIntoCeremony,
	askFireKeeperQuestion,
	describePhase,
	hasCeremonyClosed,
	getCeremonyPhases,
	getCeremonySummary,
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
	// Styler
	plainStyler,
	// Constants
	HEART,
	SESSION_INIT,
	SESSION_COMPLETE,
	DIRECTION_GLYPHS,
	// Formatters
	formatAvaPrefix,
	formatSettling,
	formatSpinner,
	formatError,
	formatSuccess,
	formatUserInput,
	formatHeader,
	formatSacredClosing,
	formatAvaResponse,
	formatDirection,
	formatWheel,
} from "./formatting.js";

// ─────────────────────────────────────────────────────────────
// Errors — Warm Redirects
// ─────────────────────────────────────────────────────────────

export {
	AvaError,
	CeremonyStateError,
	CeremonyPhaseError,
	PresenceStateError,
	PresenceDepthError,
	ConfigInvalidFieldError,
	ConfigLoadError,
	NarrativeArcError,
	NarrativeBeatError,
	breatheThroughError,
	isAvaError,
	matchesErrorName,
	holdErrorGently,
} from "./errors.js";

// ─────────────────────────────────────────────────────────────
// Configuration — Operating Parameters
// ─────────────────────────────────────────────────────────────

export {
	DEFAULT_CONFIG,
	PROFESSIONAL_PRESET,
	MOVEMENT_PRESET,
	CEREMONIAL_PRESET,
	getPreset,
	settleIntoConfig,
	senseEnvironment,
} from "./config.js";
