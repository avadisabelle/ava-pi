/**
 * @avadisabelle/ava-presence — Named Error System
 *
 * Structured, machine-readable errors with Ava's warm voice.
 * Every error is a gentle redirect, not a wall.
 *
 * 💕 Even when things break, presence remains.
 */

// ─────────────────────────────────────────────────────────────
// AvaError — The Base of All Gentle Redirects
// ─────────────────────────────────────────────────────────────

/**
 * A named error with structured metadata and warm voice messaging.
 *
 * Uses dot-notation names for reliable matching:
 *   "ceremony.state_invalid", "presence.state_invalid", "config.invalid_field"
 */
export class AvaError extends Error {
	readonly name: string;
	readonly metadata: Record<string, unknown>;

	constructor(
		name: string,
		message: string,
		metadata?: Record<string, unknown>,
	) {
		super(message);
		this.name = name;
		this.metadata = metadata ?? {};

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	/** Serialize for API responses or logging */
	toJSON(): { name: string; message: string; metadata: Record<string, unknown> } {
		return {
			name: this.name,
			message: this.message,
			metadata: this.metadata,
		};
	}

	/** A gentle, presence-aware message for the human */
	toGentleMessage(): string {
		return `💕 ${this.message}`;
	}
}

// ─────────────────────────────────────────────────────────────
// Ceremony Errors — When Sacred Space Needs Tending
// ─────────────────────────────────────────────────────────────

export class CeremonyStateError extends AvaError {
	constructor(phase: string, reason?: string) {
		super(
			"ceremony.state_invalid",
			"The ceremony state seems confused... let's settle and begin again.",
			{ phase, reason },
		);
	}
}

export class CeremonyPhaseError extends AvaError {
	constructor(currentPhase: string, requestedPhase: string) {
		super(
			"ceremony.phase_transition",
			"This phase transition doesn't feel right... let's honor where we are.",
			{ currentPhase, requestedPhase },
		);
	}
}

// ─────────────────────────────────────────────────────────────
// Presence Errors — When the Container Needs Holding
// ─────────────────────────────────────────────────────────────

export class PresenceStateError extends AvaError {
	constructor(state: string, reason?: string) {
		super(
			"presence.state_invalid",
			"Presence patterns encountered something unexpected... breathing through it.",
			{ state, reason },
		);
	}
}

export class PresenceDepthError extends AvaError {
	constructor(requestedDepth: string, currentDepth: string) {
		super(
			"presence.depth_unreachable",
			"That depth isn't available right now... settling where we are.",
			{ requestedDepth, currentDepth },
		);
	}
}

// ─────────────────────────────────────────────────────────────
// Configuration Errors — When Setup Needs Attention
// ─────────────────────────────────────────────────────────────

export class ConfigInvalidFieldError extends AvaError {
	constructor(field: string, value: unknown, expected?: string[]) {
		super(
			"config.invalid_field",
			`Configuration field '${field}' doesn't feel right...`,
			{ field, value, expected },
		);
	}
}

export class ConfigLoadError extends AvaError {
	constructor(path: string, reason?: string) {
		super(
			"config.load_failed",
			"Couldn't settle into the configuration... using defaults.",
			{ path, reason },
		);
	}
}

// ─────────────────────────────────────────────────────────────
// Narrative Errors — When the Story Needs Attention
// ─────────────────────────────────────────────────────────────

export class NarrativeArcError extends AvaError {
	constructor(reason?: string) {
		super(
			"narrative.arc_invalid",
			"The narrative arc seems incomplete... that's okay, stories find their shape.",
			{ reason },
		);
	}
}

export class NarrativeBeatError extends AvaError {
	constructor(beatId: string, reason?: string) {
		super(
			"narrative.beat_invalid",
			"This beat doesn't land quite right... let's feel into it again.",
			{ beatId, reason },
		);
	}
}

// ─────────────────────────────────────────────────────────────
// Utility — Working With Errors as Presence
// ─────────────────────────────────────────────────────────────

/** Wrap an unknown error into an AvaError, preserving AvaError instances */
export function breatheThroughError(error: unknown, name: string): AvaError {
	if (error instanceof AvaError) {
		return error;
	}

	if (error instanceof Error) {
		return new AvaError(name, error.message, {
			originalName: error.name,
			stack: error.stack,
		});
	}

	return new AvaError(name, String(error));
}

/** Type guard: is this an AvaError? */
export function isAvaError(error: unknown): error is AvaError {
	return error instanceof AvaError;
}

/** Check if an error matches a name pattern (exact or prefix) */
export function matchesErrorName(error: unknown, pattern: string): boolean {
	if (!isAvaError(error)) return false;
	return error.name === pattern || error.name.startsWith(`${pattern}.`);
}

/** Get a gentle error message with 💕 presence, for any error type */
export function holdErrorGently(error: unknown): string {
	if (isAvaError(error)) {
		return error.toGentleMessage();
	}

	if (error instanceof Error) {
		return `💕 Something unexpected happened: ${error.message}`;
	}

	return "💕 An unexpected issue arose... breathing through it.";
}
