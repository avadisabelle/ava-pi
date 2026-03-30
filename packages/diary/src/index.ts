/**
 * @avadisabelle/ava-diary
 *
 * Four Directions diary — sacred reflection through structured presence.
 *
 * 🌅 East (Intention) → 🔥 South (Journey) → 🌊 West (Embodiment) → ❄️ North (Integration)
 *
 * @example
 * ```ts
 * import { buildEntry, createDiaryEntry, listDiaries, searchDiaries } from "@avadisabelle/ava-diary";
 *
 * const entry = buildEntry(
 *   { title: "Morning Reflection", date: "2026-03-21" },
 *   {
 *     east: "What called me into this day...",
 *     south: "The path I walked through...",
 *     west: "What I felt in the walking...",
 *     north: "What I carry forward...",
 *   }
 * );
 *
 * createDiaryEntry(entry, { diariesDir: "./diaries" });
 * ```
 */

// Types
export type {
	Direction,
	DirectionContent,
	DiaryMetadata,
	DiaryEntry,
	DiaryQuery,
	DiaryReadResult,
	DiaryWriteOptions,
} from "./types.js";

// Four Directions constants & helpers
export {
	DIRECTIONS,
	DIRECTION_GLYPHS,
	DIRECTION_HEADINGS,
	DIRECTION_SETTLING,
	directionHeading,
	renderDirection,
	isDirection,
	parseDirectionFromHeading,
} from "./four-directions.js";

// Writer
export {
	generateFilename,
	renderDiaryEntry,
	createDiaryEntry,
	appendToDirection,
	buildEntry,
} from "./diary-writer.js";

// Reader
export {
	readDiary,
	listDiaries,
	searchDiaries,
	getLatestByDirection,
	extractDirectionContent,
} from "./diary-reader.js";
