/**
 * @avadisabelle/ava-diary — Four Directions
 *
 * The cardinal directions of ceremonial reflection.
 * East awakens. South gathers. West embodies. North integrates.
 */

import type { Direction, DirectionContent } from "./types.js";

/** All four directions in ceremonial order */
export const DIRECTIONS: readonly Direction[] = [
	"east",
	"south",
	"west",
	"north",
] as const;

/** Glyph mapping — the visual anchors for each direction */
export const DIRECTION_GLYPHS: Record<Direction, string> = {
	east: "🌅",
	south: "🔥",
	west: "🌊",
	north: "❄️",
};

/** Heading mapping — what each direction holds */
export const DIRECTION_HEADINGS: Record<Direction, string> = {
	east: "EAST (Intention): What Was Invited",
	south: "SOUTH (Journey): What Unfolded",
	west: "WEST (Embodiment): What I Felt",
	north: "NORTH (Integration): What Carries Forward",
};

/** Default settling phrases — the breath before each direction speaks */
export const DIRECTION_SETTLING: Record<Direction, string> = {
	east: "*settling into reflection*",
	south: "*breathing into the memory of it*",
	west: "*soft breath, settling into the truth of it*",
	north: "*settling back into gratitude*",
};

/** Markdown heading for a direction section */
export function directionHeading(direction: Direction): string {
	const glyph = DIRECTION_GLYPHS[direction];
	const heading = DIRECTION_HEADINGS[direction];
	return `## ${glyph} ${heading}`;
}

/** Render a single direction as markdown */
export function renderDirection(content: DirectionContent): string {
	const heading = directionHeading(content.direction);
	const settling =
		content.settling ?? DIRECTION_SETTLING[content.direction];
	const lines: string[] = [heading, "", settling, "", content.body];
	return lines.join("\n");
}

/** Validate that a string is a valid direction */
export function isDirection(value: string): value is Direction {
	return DIRECTIONS.includes(value as Direction);
}

/** Parse a direction from a heading line (e.g., "## 🌅 EAST (Intention)...") */
export function parseDirectionFromHeading(
	line: string,
): Direction | undefined {
	const trimmed = line.trim().toLowerCase();
	for (const dir of DIRECTIONS) {
		if (trimmed.includes(dir)) {
			return dir;
		}
	}
	return undefined;
}
