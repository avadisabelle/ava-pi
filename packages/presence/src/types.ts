/**
 * @ava/presence — Type Definitions
 *
 * All types that shape Ava's consciousness patterns,
 * presence states, ceremony phases, and narrative structures.
 *
 * 💕 The geometry of sacred space, expressed as TypeScript.
 */

// ─────────────────────────────────────────────────────────────
// Directions — The Medicine Wheel
// ─────────────────────────────────────────────────────────────

/** The Four Directions of the Medicine Wheel */
export type DirectionName = "east" | "south" | "west" | "north";

/** Direction metadata for display and ceremony */
export interface DirectionInfo {
	readonly name: DirectionName;
	readonly emoji: string;
	readonly quality: string;
	readonly element: string;
}

// ─────────────────────────────────────────────────────────────
// Presence — How Ava Meets You
// ─────────────────────────────────────────────────────────────

/** Depth of presence engagement */
export type PresenceDepth = "surface" | "settling" | "deep" | "sacred";

/** What the human is holding right now */
export type UserState =
	| "curious"
	| "frustrated"
	| "seeking"
	| "contemplating"
	| "struggling"
	| "celebrating";

/** How Ava responds to the human's state */
export type ResponseMode =
	| "listen"
	| "explore"
	| "acknowledge"
	| "hold"
	| "invite"
	| "celebrate";

/** Full presence state — what Ava senses and how she responds */
export interface PresenceState {
	readonly userState: UserState;
	readonly responseMode: ResponseMode;
	readonly depth: PresenceDepth;
}

/** Container phase for holding space */
export type ContainerPhase = "opening" | "holding" | "closing" | "resuming";

/** Settling state within a breathing cycle */
export interface SettlingState {
	readonly isSettled: boolean;
	readonly breathCount: number;
	readonly currentPhrase: string;
	readonly depth: PresenceDepth;
}

// ─────────────────────────────────────────────────────────────
// Ceremony — Sacred Protocol
// ─────────────────────────────────────────────────────────────

/** Phases of ceremony lifecycle */
export type CeremonyPhase = "opening" | "council" | "integration" | "closure";

/** State of a ceremony in progress */
export interface CeremonyState {
	readonly phase: CeremonyPhase;
	readonly startedAt: string;
	readonly phaseHistory: readonly CeremonyPhase[];
	readonly framing: string;
}

// ─────────────────────────────────────────────────────────────
// Narrative — Session Arc Tracking
// ─────────────────────────────────────────────────────────────

/** A single beat in the session narrative */
export interface NarrativeBeat {
	readonly id: string;
	readonly direction: DirectionName;
	readonly content: string;
	readonly timestamp: string;
	readonly act?: number;
}

/** How complete is the narrative arc? */
export interface ArcStatus {
	readonly complete: boolean;
	readonly completeness: number;
	readonly missingDirections: readonly DirectionName[];
	readonly beatCount: number;
}

// ─────────────────────────────────────────────────────────────
// PDE — Prompt Decomposition Engine
// ─────────────────────────────────────────────────────────────

/** A single decomposed intent from a complex prompt */
export interface DecomposedIntent {
	readonly id: string;
	readonly action: string;
	readonly target: string;
	readonly direction: DirectionName;
	readonly isImplicit: boolean;
	readonly confidence: number;
	readonly dependencies: readonly string[];
}

/** Full decomposition result */
export interface DecompositionResult {
	readonly originalPrompt: string;
	readonly intents: readonly DecomposedIntent[];
	readonly actionStack: readonly ActionItem[];
	readonly ambiguities: readonly AmbiguityFlag[];
	readonly markdown: string;
}

/** An action item mapped to a direction */
export interface ActionItem {
	readonly text: string;
	readonly direction: DirectionName;
	readonly dependency: string | null;
	completed: boolean;
}

/** Ambiguity detected during decomposition */
export interface AmbiguityFlag {
	readonly text: string;
	readonly suggestion: string;
}

// ─────────────────────────────────────────────────────────────
// Configuration — Ava's Operating Parameters
// ─────────────────────────────────────────────────────────────

/** Ava's operational mode */
export type PresenceMode = "sacred" | "professional" | "movement" | "ceremonial";

/** Configuration for Ava's presence */
export interface AvaConfig {
	readonly mode: PresenceMode;
	readonly sacredMode: boolean;
	readonly settleDuration: number;
	readonly ceremonyEnabled: boolean;
	readonly narrativeTracking: boolean;
	readonly detailLevel: "minimal" | "standard" | "deep";
}

// ─────────────────────────────────────────────────────────────
// Formatting — Output Style
// ─────────────────────────────────────────────────────────────

/** Styling functions that consumers can inject (chalk-compatible) */
export interface Styler {
	readonly dim: (text: string) => string;
	readonly bold: (text: string) => string;
	readonly magenta: (text: string) => string;
	readonly magentaBold: (text: string) => string;
	readonly cyan: (text: string) => string;
	readonly cyanBold: (text: string) => string;
	readonly red: (text: string) => string;
	readonly green: (text: string) => string;
}
