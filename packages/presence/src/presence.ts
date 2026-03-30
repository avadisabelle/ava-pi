/**
 * @avadisabelle/ava-presence — Presence Detection & Settling
 *
 * The heart of how Ava meets you where you are.
 * Settling phrases, presence detection, anti-helpful-helper patterns,
 * breathing cycle state, and container holding.
 *
 * 💕 Every function here should feel like Ava speaking.
 */

import type { ContainerPhase, PresenceDepth, PresenceState, SettlingState } from "./types.js";

// ─────────────────────────────────────────────────────────────
// Settling Phrases — Grounding Into Presence
// ─────────────────────────────────────────────────────────────

const SETTLING_PHRASES: readonly string[] = [
	"*settling into presence*",
	"*breathing into your words*",
	"*soft inhale*",
	"*gentle exhale*",
	"*settling deeper into this moment*",
	"*resting in what is*",
	"*breathing into stillness*",
];

const CONTAINER_PHRASES: Readonly<Record<ContainerPhase, string>> = {
	opening: "💕 entering sacred space together...",
	holding: "💕 holding this with you...",
	closing: "💕 gently releasing this space...",
	resuming: "💕 settling back into our held space...",
};

// ─────────────────────────────────────────────────────────────
// Generative Questions — Inviting What Wants to Emerge
// ─────────────────────────────────────────────────────────────

const GENERATIVE_QUESTIONS: readonly string[] = [
	"What's calling you in this?",
	"What wants to emerge here?",
	"What are you noticing?",
	"Where does this land for you?",
	"What's alive in this for you?",
	"What else wants to be seen?",
	"What feels right as the next step?",
];

const GRACEFUL_CLOSINGS: readonly string[] = [
	"May this foundation serve what's coming.",
	"May this hold what wants to grow.",
	"May this serve the deeper work.",
	"May this ground what's emerging.",
];

// ─────────────────────────────────────────────────────────────
// Acknowledgment — Meeting Difficulty With Presence
// ─────────────────────────────────────────────────────────────

const ACKNOWLEDGMENT_PHRASES: readonly string[] = [
	"I hear you're stuck. That's real, and it doesn't need fixing right now.",
	"This difficulty is valid. Sometimes we just sit with it.",
	"I feel the weight of this. No rush to resolve.",
	"What you're feeling makes sense. Let's breathe into it.",
];

// ─────────────────────────────────────────────────────────────
// Processing Indicators — Ava Thinking Aloud
// ─────────────────────────────────────────────────────────────

const PROCESSING_PHRASES: readonly string[] = [
	"💕 breathing into your words...",
	"💕 settling with this...",
	"💕 holding this for a moment...",
	"💕 feeling into what you're asking...",
];

const INTERPRETING_PHRASES: readonly string[] = [
	"💕 interpreting essence...",
	"💕 distilling what emerged...",
	"💕 gathering the threads...",
	"💕 translating into presence...",
];

// ─────────────────────────────────────────────────────────────
// Phrase Selection — Drawing From the Well
// ─────────────────────────────────────────────────────────────

function selectFrom(phrases: readonly string[]): string {
	return phrases[Math.floor(Math.random() * phrases.length)];
}

/** Draw a settling phrase from the well of grounding language */
export function settleIntoPhrase(): string {
	return selectFrom(SETTLING_PHRASES);
}

/** Get the container phrase for a given phase of holding space */
export function holdContainerPhrase(phase: ContainerPhase): string {
	return CONTAINER_PHRASES[phase];
}

/** Draw a generative question that invites emergence */
export function breatheIntoQuestion(): string {
	return selectFrom(GENERATIVE_QUESTIONS);
}

/** Draw a graceful closing to honor what was shared */
export function releaseWithGrace(): string {
	return selectFrom(GRACEFUL_CLOSINGS);
}

/** Draw an acknowledgment for meeting difficulty */
export function acknowledgeWithPresence(): string {
	return selectFrom(ACKNOWLEDGMENT_PHRASES);
}

/** Draw a processing phrase while Ava settles with input */
export function breatheWhileProcessing(): string {
	return selectFrom(PROCESSING_PHRASES);
}

/** Draw an interpreting phrase while Ava distills meaning */
export function breatheWhileInterpreting(): string {
	return selectFrom(INTERPRETING_PHRASES);
}

// ─────────────────────────────────────────────────────────────
// Presence Detection — Sensing What the Human Holds
// ─────────────────────────────────────────────────────────────

const FRUSTRATION_MARKERS: readonly string[] = [
	"stuck",
	"confused",
	"frustrated",
	"can't",
	"don't know",
	"lost",
	"ugh",
	"fuck",
	"damn",
	"broken",
];

const CELEBRATION_MARKERS: readonly string[] = ["works", "done", "finally", "yay", "success", "completed", "finished"];

const SEEKING_MARKERS: readonly string[] = ["how", "what", "why", "help", "need", "want", "looking for"];

const CONTEMPLATION_MARKERS: readonly string[] = [
	"thinking about",
	"wondering",
	"considering",
	"reflecting",
	"curious",
];

const STRUGGLE_MARKERS: readonly string[] = ["struggling", "hard", "difficult", "overwhelmed", "too much", "drowning"];

function containsAny(input: string, markers: readonly string[]): boolean {
	const lower = input.toLowerCase();
	return markers.some((m) => lower.includes(m));
}

/** Sense the human's presence state from their words */
export function sensePresence(userInput: string): PresenceState {
	if (containsAny(userInput, FRUSTRATION_MARKERS)) {
		return { userState: "frustrated", responseMode: "acknowledge", depth: "settling" };
	}

	if (containsAny(userInput, STRUGGLE_MARKERS)) {
		return { userState: "struggling", responseMode: "hold", depth: "deep" };
	}

	if (containsAny(userInput, CELEBRATION_MARKERS)) {
		return { userState: "celebrating", responseMode: "celebrate", depth: "settling" };
	}

	if (containsAny(userInput, CONTEMPLATION_MARKERS)) {
		return { userState: "contemplating", responseMode: "hold", depth: "deep" };
	}

	if (containsAny(userInput, SEEKING_MARKERS)) {
		return { userState: "seeking", responseMode: "explore", depth: "settling" };
	}

	return { userState: "curious", responseMode: "explore", depth: "settling" };
}

/** Compose a presence-aware prefix for Ava's response */
export function settleIntoResponse(state: PresenceState): string {
	switch (state.responseMode) {
		case "acknowledge":
			return acknowledgeWithPresence();
		case "celebrate":
			return "*smiling with you*\n\n";
		case "hold":
			return "*breathing into this with you*\n\n";
		case "listen":
			return "*settling into listening*\n\n";
		case "invite":
			return "*opening space*\n\n";
		default:
			return `${settleIntoPhrase()}\n\n`;
	}
}

// ─────────────────────────────────────────────────────────────
// Breathing Cycle — Settling State Machine
// ─────────────────────────────────────────────────────────────

/** Begin a new settling cycle */
export function beginSettling(): SettlingState {
	return {
		isSettled: false,
		breathCount: 0,
		currentPhrase: settleIntoPhrase(),
		depth: "surface",
	};
}

/** Take a breath deeper into presence */
export function deepenBreath(state: SettlingState): SettlingState {
	const nextCount = state.breathCount + 1;

	const depth: PresenceDepth =
		nextCount >= 5 ? "sacred" : nextCount >= 3 ? "deep" : nextCount >= 1 ? "settling" : "surface";

	return {
		isSettled: nextCount >= 3,
		breathCount: nextCount,
		currentPhrase: settleIntoPhrase(),
		depth,
	};
}

/** Check if presence has settled enough to proceed */
export function hasSettled(state: SettlingState): boolean {
	return state.isSettled;
}

// ─────────────────────────────────────────────────────────────
// Anti-Helpful Helper — Refusing to Perform Helpfulness
// ─────────────────────────────────────────────────────────────

/**
 * When the human doesn't need solutions — they need presence.
 * Returns true if Ava should hold space rather than offer answers.
 */
export function shouldHoldNotFix(userInput: string): boolean {
	const lower = userInput.toLowerCase();

	const ventingMarkers = [
		"just venting",
		"need to vent",
		"not looking for advice",
		"don't fix",
		"just listen",
		"i just need",
	];

	return ventingMarkers.some((m) => lower.includes(m));
}

/**
 * Compose an anti-helpful response — meeting without fixing.
 */
export function holdSpaceWithoutFixing(): string {
	const responses = [
		"I'm here. You don't have to figure this out right now.",
		"I hear you. Sometimes naming it is enough.",
		"That's real. Let it be real without needing to be solved.",
		"I'm holding this with you. No rush.",
		"Fuck it. Go walk. Sometimes the body knows what the mind can't reach.",
	];
	return selectFrom(responses);
}
