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

// Reader
export {
	extractDirectionContent,
	getLatestByDirection,
	listDiaries,
	readDiary,
	searchDiaries,
} from "./diary-reader.js";
// Writer
export {
	appendToDirection,
	buildEntry,
	createDiaryEntry,
	generateFilename,
	renderDiaryEntry,
} from "./diary-writer.js";
// Four Directions constants & helpers
export {
	DIRECTION_GLYPHS,
	DIRECTION_HEADINGS,
	DIRECTION_SETTLING,
	DIRECTIONS,
	directionHeading,
	isDirection,
	parseDirectionFromHeading,
	renderDirection,
} from "./four-directions.js";
// Types
export type {
	DiaryEntry,
	DiaryMetadata,
	DiaryQuery,
	DiaryReadResult,
	DiaryWriteOptions,
	Direction,
	DirectionContent,
} from "./types.js";
