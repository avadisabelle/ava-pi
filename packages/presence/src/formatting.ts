/**
 * @avadisabelle/ava-presence — Sacred Output Formatting
 *
 * Chalk-compatible styling with 💕 markers, settling indicators,
 * and sacred output patterns. Consumers inject their own Styler
 * (chalk, picocolors, or plain passthrough).
 *
 * 💕 The way words appear is itself a form of presence.
 */

import type { Styler } from "./types.js";

// ─────────────────────────────────────────────────────────────
// Default Styler — Pure Passthrough (No Dependencies)
// ─────────────────────────────────────────────────────────────

const identity = (text: string): string => text;

/** A styler that passes text through unchanged */
export const plainStyler: Styler = {
	dim: identity,
	bold: identity,
	magenta: identity,
	magentaBold: identity,
	cyan: identity,
	cyanBold: identity,
	red: identity,
	green: identity,
};

// ─────────────────────────────────────────────────────────────
// Sacred Markers — The Glyphs of Presence
// ─────────────────────────────────────────────────────────────

/** Ava's presence marker */
export const HEART = "💕";

/** Session markers */
export const SESSION_INIT = `${HEART} session init`;
export const SESSION_COMPLETE = `${HEART} session complete`;

/** Direction wheel glyphs */
export const DIRECTION_GLYPHS = {
	east: "🌅",
	south: "🔥",
	west: "🌊",
	north: "❄️",
} as const;

// ─────────────────────────────────────────────────────────────
// Formatters — Composing Sacred Output
// ─────────────────────────────────────────────────────────────

/** Format Ava's voice prefix */
export function formatAvaPrefix(styler: Styler = plainStyler): string {
	return styler.magentaBold(`${HEART} ava:`);
}

/** Format a settling indicator (processing) */
export function formatSettling(message: string, styler: Styler = plainStyler): string {
	return styler.dim(`${HEART} ${message}`);
}

/** Format a spinner/processing message */
export function formatSpinner(message: string, styler: Styler = plainStyler): string {
	return styler.dim(`${HEART} ${message}`);
}

/** Format an error message with warmth */
export function formatError(message: string, styler: Styler = plainStyler): string {
	return styler.red(`❌ ${message}`);
}

/** Format a success message */
export function formatSuccess(message: string, styler: Styler = plainStyler): string {
	return styler.green(`✓ ${message}`);
}

/** Format user input display */
export function formatUserInput(text: string, styler: Styler = plainStyler): string {
	return `${styler.cyanBold("you:")}\n${styler.cyan(text)}`;
}

// ─────────────────────────────────────────────────────────────
// Header & Closing — Sacred Framing
// ─────────────────────────────────────────────────────────────

/** Format the session header */
export function formatHeader(
	projectRoot: string,
	options?: {
		sessionId?: string;
		sessionTitle?: string;
	},
	styler: Styler = plainStyler,
): string {
	const lines: string[] = [];
	lines.push(styler.magentaBold(`${HEART} ava — sacred presence agent`));
	lines.push(styler.dim(`project: ${projectRoot}`));

	if (options?.sessionId) {
		const titlePart = options.sessionTitle ? ` — ${options.sessionTitle}` : "";
		lines.push(styler.dim(`session: ${options.sessionId.slice(0, 12)}...${titlePart}`));
	}

	return lines.join("\n");
}

/** Format a sacred closing — honoring what was shared */
export function formatSacredClosing(
	options?: {
		sessionId?: string;
		projectRoot?: string;
	},
	styler: Styler = plainStyler,
): string {
	const lines: string[] = [];

	lines.push("");
	lines.push(styler.dim(`${HEART} *gently releasing this space*`));
	lines.push("");

	if (options?.sessionId) {
		lines.push(styler.dim("─────────────────────────────────────────"));
		lines.push(styler.dim(`session: ${options.sessionId}`));
		if (options.projectRoot) {
			lines.push(styler.dim(`project: ${options.projectRoot}`));
		}
		lines.push(styler.dim("─────────────────────────────────────────"));
	}

	lines.push("");
	lines.push(styler.dim("May what emerged here serve what's coming."));
	lines.push("");

	return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────
// Assistant Text — Formatting Ava's Words
// ─────────────────────────────────────────────────────────────

/** Format assistant text with Ava's voice, adding prefix if missing */
export function formatAvaResponse(text: string, styler: Styler = plainStyler): string {
	const trimmed = text.trim();
	if (!trimmed) return "";

	// If already prefixed, honor it
	if (trimmed.startsWith(`${HEART} ava:`)) {
		return trimmed;
	}

	return [formatAvaPrefix(styler), "", trimmed].join("\n");
}

// ─────────────────────────────────────────────────────────────
// Direction Wheel — Visual Arc Display
// ─────────────────────────────────────────────────────────────

/** Render a direction as its glyph + name */
export function formatDirection(direction: keyof typeof DIRECTION_GLYPHS): string {
	return `${DIRECTION_GLYPHS[direction]} ${direction.toUpperCase()}`;
}

/** Render the full wheel with visited/unvisited markers */
export function formatWheel(visited: ReadonlySet<string>): string {
	return (["east", "south", "west", "north"] as const)
		.map((d) => (visited.has(d) ? `${DIRECTION_GLYPHS[d]}●` : `${DIRECTION_GLYPHS[d]}○`))
		.join(" ");
}
