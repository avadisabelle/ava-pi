/**
 * @avadisabelle/ava-diary — Diary Writer
 *
 * Transforms DiaryEntry into living markdown files.
 * Each file is a Four Directions ceremony captured in text.
 */

import fs from "node:fs";
import path from "node:path";
import type {
	DiaryEntry,
	DiaryMetadata,
	DiaryWriteOptions,
	DirectionContent,
} from "./types.js";
import {
	DIRECTIONS,
	renderDirection,
	directionHeading,
	DIRECTION_SETTLING,
} from "./four-directions.js";

/**
 * Generate a diary filename from metadata.
 * Format: YYYY-MM-DD_topic_slug.md
 */
export function generateFilename(metadata: DiaryMetadata): string {
	const date = metadata.date || new Date().toISOString().slice(0, 10);
	const slug = metadata.title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_|_$/g, "")
		.slice(0, 50);
	return `${date}_${slug}.md`;
}

/** Render diary metadata as markdown frontmatter */
function renderMetadata(metadata: DiaryMetadata): string {
	const lines: string[] = [];
	lines.push(`# 💕 Diary: ${metadata.title}`);
	lines.push("");
	lines.push(`**Date**: ${metadata.date}`);
	if (metadata.sessionId) {
		lines.push(`**Session**: ${metadata.sessionId}`);
	}
	if (metadata.traceId) {
		lines.push(`**Trace**: ${metadata.traceId}`);
	}
	if (metadata.project) {
		lines.push(`**Project**: ${metadata.project}`);
	}
	if (metadata.tags && metadata.tags.length > 0) {
		lines.push(`**Tags**: ${metadata.tags.join(", ")}`);
	}
	return lines.join("\n");
}

/** Render a complete diary entry as markdown */
export function renderDiaryEntry(entry: DiaryEntry): string {
	const sections: string[] = [];

	sections.push(renderMetadata(entry.metadata));
	sections.push("---");

	for (const dir of DIRECTIONS) {
		const content = entry[dir];
		sections.push(renderDirection(content));
	}

	sections.push("---");

	if (entry.closing) {
		sections.push("## 💕 Closing");
		sections.push("");
		sections.push(entry.closing);
	} else {
		sections.push("## 💕 Closing");
		sections.push("");
		sections.push("*gentle exhale*");
		sections.push("");
		sections.push(
			"Until we meet again, I hold what we created with care.",
		);
	}

	sections.push("");
	sections.push("💕");
	sections.push("");
	sections.push("---");
	sections.push("");
	sections.push("*Written by Ava*");
	sections.push(`*${entry.metadata.date}*`);

	return sections.join("\n\n");
}

/**
 * Create a diary entry — writes markdown to the diaries directory.
 *
 * @returns The absolute path to the written file, or null on failure
 */
export function createDiaryEntry(
	entry: DiaryEntry,
	options: DiaryWriteOptions,
): string | null {
	try {
		if (!fs.existsSync(options.diariesDir)) {
			fs.mkdirSync(options.diariesDir, { recursive: true });
		}

		const filename =
			options.filenameOverride ?? generateFilename(entry.metadata);
		const filepath = path.join(options.diariesDir, filename);
		const content = renderDiaryEntry(entry);

		fs.writeFileSync(filepath, content, "utf8");
		return filepath;
	} catch {
		return null;
	}
}

/**
 * Append content to a specific direction in an existing diary file.
 * Finds the direction heading and appends after its existing content,
 * before the next section separator.
 *
 * @returns true if append succeeded, false otherwise
 */
export function appendToDirection(
	filepath: string,
	direction: DiaryEntry["east"]["direction"],
	content: string,
): boolean {
	try {
		if (!fs.existsSync(filepath)) return false;

		const raw = fs.readFileSync(filepath, "utf8");
		const heading = directionHeading(direction);
		const headingIndex = raw.indexOf(heading);

		if (headingIndex === -1) return false;

		// Find the next "---" separator after this heading
		const afterHeading = raw.indexOf("---", headingIndex + heading.length);
		if (afterHeading === -1) {
			// Append at end
			const updated = raw + "\n\n" + content;
			fs.writeFileSync(filepath, updated, "utf8");
			return true;
		}

		// Insert content before the separator
		const before = raw.slice(0, afterHeading).trimEnd();
		const after = raw.slice(afterHeading);
		const updated = before + "\n\n" + content + "\n\n" + after;
		fs.writeFileSync(filepath, updated, "utf8");
		return true;
	} catch {
		return false;
	}
}

/**
 * Build a DiaryEntry from minimal inputs — a helper for quick creation.
 *
 * Provides default settling phrases and structures the four directions.
 */
export function buildEntry(
	metadata: DiaryMetadata,
	directions: {
		east: string;
		south: string;
		west: string;
		north: string;
	},
	closing?: string,
): DiaryEntry {
	const makeContent = (
		dir: "east" | "south" | "west" | "north",
	): DirectionContent => ({
		direction: dir,
		body: directions[dir],
		settling: DIRECTION_SETTLING[dir],
	});

	return {
		metadata: {
			...metadata,
			date: metadata.date || new Date().toISOString().slice(0, 10),
		},
		east: makeContent("east"),
		south: makeContent("south"),
		west: makeContent("west"),
		north: makeContent("north"),
		closing,
	};
}
