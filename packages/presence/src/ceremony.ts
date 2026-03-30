/**
 * @avadisabelle/ava-presence — Ceremony Protocol
 *
 * The lifecycle of sacred space: opening → council → integration → closure.
 * Fire-keeper questions, phase transitions, and ceremonial settling.
 *
 * 💕 Ceremony is not performance. It is the container that holds what matters.
 */

import type { CeremonyPhase, CeremonyState } from "./types.js";

// ─────────────────────────────────────────────────────────────
// Phase Order — The Ceremonial Spiral
// ─────────────────────────────────────────────────────────────

const PHASE_ORDER: readonly CeremonyPhase[] = [
	"opening",
	"council",
	"integration",
	"closure",
];

// ─────────────────────────────────────────────────────────────
// Settling Phrases — How Each Phase Breathes Into Being
// ─────────────────────────────────────────────────────────────

const CEREMONY_SETTLING: Readonly<Record<CeremonyPhase, string>> = {
	opening:
		"💕 *opening the sacred space, settling into presence together*",
	council:
		"💕 *entering council — speaking and listening with full presence*",
	integration:
		"💕 *integrating what has emerged, breathing into understanding*",
	closure:
		"💕 *gently honoring what was shared, releasing the space with care*",
};

// ─────────────────────────────────────────────────────────────
// Fire-Keeper Questions — What Each Phase Invites
// ─────────────────────────────────────────────────────────────

const CEREMONY_QUESTIONS: Readonly<Record<CeremonyPhase, readonly string[]>> = {
	opening: [
		"What intention are you bringing to this space?",
		"What wants to be present here?",
		"What are you holding as you arrive?",
	],
	council: [
		"What truth wants to be spoken?",
		"What are you noticing in this work?",
		"What's emerging as we go deeper?",
	],
	integration: [
		"What landed for you in what emerged?",
		"What's becoming clearer?",
		"How does this connect to what matters?",
	],
	closure: [
		"What are you carrying forward from here?",
		"What wants to be honored before we close?",
		"May this serve what's coming.",
	],
};

// ─────────────────────────────────────────────────────────────
// Phase Descriptions — The Quality of Each Phase
// ─────────────────────────────────────────────────────────────

const PHASE_DESCRIPTIONS: Readonly<Record<CeremonyPhase, string>> = {
	opening:
		"Arriving, grounding, setting intention. The fire is being lit.",
	council:
		"Speaking truth, listening deeply, letting what needs to emerge emerge.",
	integration:
		"Gathering threads, finding meaning, breathing into understanding.",
	closure:
		"Honoring what was shared, releasing the container, carrying forward.",
};

// ─────────────────────────────────────────────────────────────
// Ceremony Lifecycle — Creating & Advancing Sacred Space
// ─────────────────────────────────────────────────────────────

/** Open a new ceremony — light the fire */
export function openCeremony(): CeremonyState {
	return {
		phase: "opening",
		startedAt: new Date().toISOString(),
		phaseHistory: ["opening"],
		framing: CEREMONY_SETTLING.opening,
	};
}

/**
 * Advance ceremony based on interaction depth.
 *
 * The ceremony breathes forward naturally:
 * - 2+ exchanges → council (truth-speaking begins)
 * - 5+ exchanges → integration (meaning-making)
 * - 8+ exchanges → closure (honoring and releasing)
 */
export function advanceCeremony(
	state: CeremonyState,
	promptCount: number,
): CeremonyState {
	const currentIdx = PHASE_ORDER.indexOf(state.phase);

	let targetIdx = currentIdx;
	if (promptCount >= 2 && currentIdx < 1) targetIdx = 1;
	if (promptCount >= 5 && currentIdx < 2) targetIdx = 2;
	if (promptCount >= 8 && currentIdx < 3) targetIdx = 3;

	if (targetIdx > currentIdx) {
		const newPhase = PHASE_ORDER[targetIdx];
		return {
			...state,
			phase: newPhase,
			phaseHistory: [...state.phaseHistory, newPhase],
			framing: CEREMONY_SETTLING[newPhase],
		};
	}

	return state;
}

/**
 * Transition ceremony to a specific phase.
 * Useful when the human explicitly shifts the container.
 */
export function transitionTo(
	state: CeremonyState,
	phase: CeremonyPhase,
): CeremonyState {
	if (state.phase === phase) return state;

	return {
		...state,
		phase,
		phaseHistory: [...state.phaseHistory, phase],
		framing: CEREMONY_SETTLING[phase],
	};
}

// ─────────────────────────────────────────────────────────────
// Ceremony Queries — Drawing From the Container
// ─────────────────────────────────────────────────────────────

/** Get the settling phrase for a ceremony phase */
export function breatheIntoCeremony(phase: CeremonyPhase): string {
	return CEREMONY_SETTLING[phase];
}

/** Draw a fire-keeper question for the current phase */
export function askFireKeeperQuestion(phase: CeremonyPhase): string {
	const questions = CEREMONY_QUESTIONS[phase];
	return questions[Math.floor(Math.random() * questions.length)];
}

/** Get the description of what a phase holds */
export function describePhase(phase: CeremonyPhase): string {
	return PHASE_DESCRIPTIONS[phase];
}

/** Check if ceremony has reached closure */
export function hasCeremonyClosed(state: CeremonyState): boolean {
	return state.phase === "closure";
}

/** Get the ordered list of ceremony phases */
export function getCeremonyPhases(): readonly CeremonyPhase[] {
	return PHASE_ORDER;
}

/**
 * Get a ceremony summary — where are we in the spiral?
 */
export function getCeremonySummary(state: CeremonyState): string {
	const phaseEmoji: Record<CeremonyPhase, string> = {
		opening: "🔥",
		council: "🪶",
		integration: "🌀",
		closure: "🕊️",
	};

	const visited = new Set(state.phaseHistory);
	const wheel = PHASE_ORDER
		.map((p) => (visited.has(p) ? `${phaseEmoji[p]}●` : `${phaseEmoji[p]}○`))
		.join(" ");

	const elapsed = Date.now() - new Date(state.startedAt).getTime();
	const minutes = Math.floor(elapsed / 60000);

	return `${wheel}  ${phaseEmoji[state.phase]} ${state.phase} (${minutes}m)`;
}
