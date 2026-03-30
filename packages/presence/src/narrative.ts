/**
 * @avadisabelle/ava-presence — Narrative Intelligence
 *
 * Session arc tracking, beat detection, and Four Directions inference
 * from conversation flow. Every session tells a story through the wheel.
 *
 * 💕 The narrative is not imposed — it is witnessed as it emerges.
 */

import type { DirectionName, NarrativeBeat, ArcStatus } from "./types.js";

// ─────────────────────────────────────────────────────────────
// Direction Constants
// ─────────────────────────────────────────────────────────────

const DIRECTION_ORDER: readonly DirectionName[] = ["east", "south", "west", "north"];

const DIRECTION_EMOJI: Readonly<Record<DirectionName, string>> = {
	east: "🌅",
	south: "🔥",
	west: "🌊",
	north: "❄️",
};

// ─────────────────────────────────────────────────────────────
// Direction Inference — Sensing Which Direction a Prompt Faces
// ─────────────────────────────────────────────────────────────

const EAST_MARKERS: readonly string[] = [
	"what", "why", "understand", "explore", "vision",
	"imagine", "dream", "envision", "curious", "wonder",
	"orient", "begin", "awaken", "see",
];

const SOUTH_MARKERS: readonly string[] = [
	"analyze", "research", "study", "learn", "investigate",
	"data", "compare", "measure", "find", "gather",
	"plan", "prepare", "relationship",
];

const WEST_MARKERS: readonly string[] = [
	"test", "validate", "check", "verify", "reflect",
	"review", "feel", "sense", "embody", "practice",
	"live", "experience", "settle",
];

const NORTH_MARKERS: readonly string[] = [
	"create", "build", "implement", "deploy", "execute",
	"write", "make", "commit", "ship", "deliver",
	"wisdom", "integrate", "complete",
];

/** Sense which direction a prompt faces based on its content */
export function inferDirection(prompt: string): DirectionName {
	const lower = prompt.toLowerCase();

	const scores: Record<DirectionName, number> = { east: 0, south: 0, west: 0, north: 0 };

	for (const m of EAST_MARKERS) if (lower.includes(m)) scores.east++;
	for (const m of SOUTH_MARKERS) if (lower.includes(m)) scores.south++;
	for (const m of WEST_MARKERS) if (lower.includes(m)) scores.west++;
	for (const m of NORTH_MARKERS) if (lower.includes(m)) scores.north++;

	const maxScore = Math.max(...Object.values(scores));
	if (maxScore === 0) return "east"; // Begin at the dawn

	const top = (Object.entries(scores) as [DirectionName, number][])
		.filter(([, s]) => s === maxScore)
		.map(([d]) => d);

	return top[0];
}

// ─────────────────────────────────────────────────────────────
// SessionArc — Tracking the Story as It Emerges
// ─────────────────────────────────────────────────────────────

/**
 * Tracks narrative beats within a session.
 * Each interaction can generate a beat; the arc tracks
 * progression through the Four Directions.
 */
export class SessionArc {
	private beats: NarrativeBeat[] = [];

	/** Record a new beat in the session narrative */
	addBeat(direction: DirectionName, content: string): NarrativeBeat {
		const beat: NarrativeBeat = {
			id: `beat-${this.beats.length + 1}`,
			direction,
			content: content.slice(0, 200),
			timestamp: new Date().toISOString(),
			act: this.beats.length + 1,
		};
		this.beats.push(beat);
		return beat;
	}

	/** Witness all beats that have emerged */
	getBeats(): readonly NarrativeBeat[] {
		return [...this.beats];
	}

	/** Sense which direction a prompt faces and record it */
	witnessAndRecord(prompt: string): NarrativeBeat {
		const direction = inferDirection(prompt);
		return this.addBeat(direction, prompt);
	}

	/**
	 * Suggest the next direction based on spiral progression.
	 * The wheel turns: east → south → west → north → east (deeper).
	 */
	suggestNextDirection(): DirectionName {
		if (this.beats.length === 0) return "east";

		const visited = new Set(this.beats.map((b) => b.direction));

		// Find first unvisited direction in the cycle
		for (const dir of DIRECTION_ORDER) {
			if (!visited.has(dir)) return dir;
		}

		// All visited — spiral deeper: continue from last direction
		const lastDir = this.beats[this.beats.length - 1].direction;
		const lastIdx = DIRECTION_ORDER.indexOf(lastDir);
		return DIRECTION_ORDER[(lastIdx + 1) % 4];
	}

	/** Assess how complete the narrative arc is */
	assessArc(): ArcStatus {
		const visited = new Set(this.beats.map((b) => b.direction));
		const missing = DIRECTION_ORDER.filter((d) => !visited.has(d));
		const completeness = visited.size / 4;

		return {
			complete: missing.length === 0,
			completeness,
			missingDirections: missing,
			beatCount: this.beats.length,
		};
	}

	/**
	 * Compose an arc summary — the wheel rendered as text.
	 *
	 * Example: 🌅● 🔥● 🌊○ ❄️○  50% complete (3 beats)
	 *            → next: 🌊 WEST
	 */
	renderArcSummary(): string {
		const status = this.assessArc();
		const visited = new Set(this.beats.map((b) => b.direction));

		const wheel = DIRECTION_ORDER
			.map((d) => (visited.has(d) ? `${DIRECTION_EMOJI[d]}●` : `${DIRECTION_EMOJI[d]}○`))
			.join(" ");

		const pct = Math.round(status.completeness * 100);
		let summary = `${wheel}  ${pct}% complete (${status.beatCount} beats)`;

		if (!status.complete) {
			const nextDir = this.suggestNextDirection();
			summary += `\n  → next: ${DIRECTION_EMOJI[nextDir]} ${nextDir.toUpperCase()}`;
		}

		return summary;
	}

	/** Get the number of beats recorded */
	get length(): number {
		return this.beats.length;
	}
}
