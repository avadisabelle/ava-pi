/**
 * @avadisabelle/ava-diary — Diary Reader
 *
 * Reads, lists, searches, and retrieves diary entries from the filesystem.
 * Returns structured results from the living Four Directions archive.
 */

import fs from "node:fs";
import path from "node:path";
import type {
	DiaryMetadata,
	DiaryQuery,
	DiaryReadResult,
	Direction,
} from "./types.js";
import { DIRECTIONS, parseDirectionFromHeading } from "./four-directions.js";

/**
 * Parse metadata from the header section of a diary markdown file.
 * Best-effort — returns whatever fields can be extracted.
 */
function parseMetadata(raw: string): Partial<DiaryMetadata> {
	const meta: Partial<DiaryMetadata> = {};

	// Title: "# 💕 Diary: <title>"
	const titleMatch = raw.match(/^#\s+💕\s*Diary:\s*(.+)$/m);
	if (titleMatch) {
		meta.title = titleMatch[1].trim();
	}

	// Date: "**Date**: <date>"
	const dateMatch = raw.match(/\*\*Date\*\*:\s*(.+)$/m);
	if (dateMatch) {
		meta.date = dateMatch[1].trim();
	}

	// Session: "**Session**: <id>"
	const sessionMatch = raw.match(/\*\*Session\*\*:\s*(.+)$/m);
	if (sessionMatch) {
		meta.sessionId = sessionMatch[1].trim();
	}

	// Trace: "**Trace**: <id>"
	const traceMatch = raw.match(/\*\*Trace\*\*:\s*(.+)$/m);
	if (traceMatch) {
		meta.traceId = traceMatch[1].trim();
	}

	// Project: "**Project**: <path>"
	const projectMatch = raw.match(/\*\*Project\*\*:\s*(.+)$/m);
	if (projectMatch) {
		meta.project = projectMatch[1].trim();
	}

	// Tags: "**Tags**: tag1, tag2, tag3"
	const tagsMatch = raw.match(/\*\*Tags\*\*:\s*(.+)$/m);
	if (tagsMatch) {
		meta.tags = tagsMatch[1].split(",").map((t) => t.trim());
	}

	return meta;
}

/**
 * Check whether a diary entry's date falls within a range.
 */
function dateInRange(
	date: string | undefined,
	from?: string,
	to?: string,
): boolean {
	if (!date) return true;
	// Normalize to YYYY-MM-DD for comparison
	const d = date.slice(0, 10);
	if (from && d < from.slice(0, 10)) return false;
	if (to && d > to.slice(0, 10)) return false;
	return true;
}

/**
 * Check whether raw content contains a direction heading.
 */
function hasDirection(raw: string, direction: Direction): boolean {
	const lower = raw.toLowerCase();
	// Look for "## 🌅 EAST" or similar patterns
	return lower.includes(`## `) && lower.includes(direction);
}

/**
 * Read a single diary file and return a structured result.
 */
export function readDiary(filepath: string): DiaryReadResult | null {
	try {
		if (!fs.existsSync(filepath)) return null;

		const raw = fs.readFileSync(filepath, "utf8");
		const metadata = parseMetadata(raw);
		const filename = path.basename(filepath);

		return {
			filepath,
			filename,
			raw,
			metadata,
			parsed: !!metadata.title && !!metadata.date,
		};
	} catch {
		return null;
	}
}

/**
 * List diary files in a directory, sorted most-recent-first.
 *
 * @returns Array of filenames (not full paths)
 */
export function listDiaries(diariesDir: string): string[] {
	try {
		if (!fs.existsSync(diariesDir)) return [];

		return fs
			.readdirSync(diariesDir)
			.filter((f) => f.endsWith(".md"))
			.sort()
			.reverse();
	} catch {
		return [];
	}
}

/**
 * Search diaries with structured query filters.
 *
 * Supports date range, direction presence, full-text search, and tag filtering.
 */
export function searchDiaries(
	diariesDir: string,
	query: DiaryQuery,
): DiaryReadResult[] {
	const filenames = listDiaries(diariesDir);
	const results: DiaryReadResult[] = [];
	const limit = query.limit ?? 50;

	for (const filename of filenames) {
		if (results.length >= limit) break;

		const filepath = path.join(diariesDir, filename);
		const result = readDiary(filepath);
		if (!result) continue;

		// Date range filter
		if (!dateInRange(result.metadata.date, query.fromDate, query.toDate)) {
			continue;
		}

		// Direction filter
		if (query.direction && !hasDirection(result.raw, query.direction)) {
			continue;
		}

		// Full-text search
		if (query.search) {
			const searchLower = query.search.toLowerCase();
			if (!result.raw.toLowerCase().includes(searchLower)) {
				continue;
			}
		}

		// Tag filter
		if (query.tags && query.tags.length > 0) {
			const entryTags = result.metadata.tags ?? [];
			const hasMatchingTag = query.tags.some((t) =>
				entryTags.includes(t),
			);
			if (!hasMatchingTag) continue;
		}

		results.push(result);
	}

	return results;
}

/**
 * Get the most recent diary entry that contains content for a given direction.
 */
export function getLatestByDirection(
	diariesDir: string,
	direction: Direction,
): DiaryReadResult | null {
	const results = searchDiaries(diariesDir, {
		direction,
		limit: 1,
	});
	return results[0] ?? null;
}

/**
 * Extract the body text for a specific direction from raw diary content.
 *
 * Finds the direction heading and returns all content until the next
 * section separator (---) or the next direction heading.
 */
export function extractDirectionContent(
	raw: string,
	direction: Direction,
): string | null {
	const lines = raw.split("\n");
	let capturing = false;
	const captured: string[] = [];

	for (const line of lines) {
		if (line.startsWith("## ")) {
			const parsed = parseDirectionFromHeading(line);
			if (parsed === direction) {
				capturing = true;
				continue;
			}
			if (capturing && parsed !== undefined) {
				// Hit the next direction — stop
				break;
			}
		}

		if (capturing) {
			if (line.trim() === "---") break;
			captured.push(line);
		}
	}

	if (captured.length === 0) return null;

	// Trim leading/trailing empty lines
	while (captured.length > 0 && captured[0].trim() === "") captured.shift();
	while (captured.length > 0 && captured[captured.length - 1].trim() === "")
		captured.pop();

	return captured.join("\n") || null;
}
