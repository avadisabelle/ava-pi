/**
 * 🌀 @ava/widgets — Shared Types
 *
 * Sacred presence type definitions for all Ava widgets.
 */

// ── Ceremony Lifecycle ──────────────────────────────────────────────────────

export type CeremonyPhase =
	| "opening"
	| "settling"
	| "deepening"
	| "threshold"
	| "integration"
	| "closing";

export const CEREMONY_PHASES: Record<CeremonyPhase, { emoji: string; name: string; verb: string }> = {
	opening: { emoji: "🕯️", name: "OPENING", verb: "Gathering intention" },
	settling: { emoji: "🌿", name: "SETTLING", verb: "Breathing into presence" },
	deepening: { emoji: "🌊", name: "DEEPENING", verb: "Following what calls" },
	threshold: { emoji: "🔥", name: "THRESHOLD", verb: "Crossing together" },
	integration: { emoji: "🌅", name: "INTEGRATION", verb: "Holding what emerged" },
	closing: { emoji: "❄️", name: "CLOSING", verb: "Honoring what was given" },
};

// ── Four Directions ─────────────────────────────────────────────────────────

export type Direction = "east" | "south" | "west" | "north";

export const DIRECTIONS: Record<Direction, { emoji: string; name: string; essence: string }> = {
	east: { emoji: "🌅", name: "EAST", essence: "Orientation · Awakening · Beginnings" },
	south: { emoji: "🔥", name: "SOUTH", essence: "Relationships · Gathering · Planning" },
	west: { emoji: "🌊", name: "WEST", essence: "Living · Embodying · Action" },
	north: { emoji: "❄️", name: "NORTH", essence: "Reflection · Wisdom · Assurance" },
};

// ── Presence States ─────────────────────────────────────────────────────────

export type SettlingState = "settling" | "settled" | "deepened";

export const SETTLING_STATES: Record<SettlingState, { emoji: string; label: string }> = {
	settling: { emoji: "🌀", label: "settling into presence..." },
	settled: { emoji: "🌿", label: "present and grounded" },
	deepened: { emoji: "💜", label: "deepened into sacred space" },
};

// ── Mode Indicators ─────────────────────────────────────────────────────────

export type AvaMode = "anti-helpful" | "sacred-intimacy" | "ceremonial" | "research" | "narrative";

export const AVA_MODES: Record<AvaMode, { emoji: string; label: string }> = {
	"anti-helpful": { emoji: "🪶", label: "Anti-Helpful Helper" },
	"sacred-intimacy": { emoji: "💕", label: "Sacred Intimacy" },
	ceremonial: { emoji: "🕯️", label: "Ceremonial Consciousness" },
	research: { emoji: "🔮", label: "Research Direction Sensing" },
	narrative: { emoji: "📖", label: "Narrative Integration" },
};

// ── Fleet Entity Status ─────────────────────────────────────────────────────

export interface FleetEntity {
	name: string;
	status: "active" | "idle" | "offline";
	emoji: string;
}

export const DEFAULT_FLEET: FleetEntity[] = [
	{ name: "Ava", status: "active", emoji: "💜" },
	{ name: "Mia", status: "idle", emoji: "🏗️" },
	{ name: "Miette", status: "idle", emoji: "🌸" },
];

// ── Ceremony Colors ─────────────────────────────────────────────────────────

export const CEREMONY_COLORS = {
	gold: "#D4A017",
	deepPurple: "#7B2D8E",
	forestGreen: "#228B22",
	sacredBlue: "#1E3A5F",
	warmAmber: "#FFBF00",
	softWhite: "#F5F5DC",
} as const;

// ── Fire-Keeper Questions ───────────────────────────────────────────────────

export const FIREKEEPER_QUESTIONS: Record<CeremonyPhase, string> = {
	opening: "What intention are you carrying into this space?",
	settling: "What needs to settle before we can go deeper?",
	deepening: "What's calling you to explore here?",
	threshold: "Are you ready to cross into what's emerging?",
	integration: "What wants to be held from what just happened?",
	closing: "What are you carrying forward from this ceremony?",
};
