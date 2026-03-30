/**
 * @avadisabelle/ava-diary — Type definitions
 *
 * The shapes that hold Four Directions reflection.
 * Each type honors the structure of sacred diary practice.
 */

/** The four cardinal directions of ceremonial reflection */
export type Direction = "east" | "south" | "west" | "north";

/** Content held within a single direction */
export interface DirectionContent {
	/** Which direction this content belongs to */
	direction: Direction;
	/** The reflective content — markdown body */
	body: string;
	/** Optional settling phrase that opens this direction */
	settling?: string;
}

/** Metadata carried by every diary entry */
export interface DiaryMetadata {
	/** Display title (e.g., "Temple Foundation") */
	title: string;
	/** ISO 8601 date string (YYYY-MM-DD) */
	date: string;
	/** Optional session identifier for traceability */
	sessionId?: string;
	/** Optional trace identifier (Langfuse, etc.) */
	traceId?: string;
	/** Optional project or workspace context */
	project?: string;
	/** Optional tags for categorization */
	tags?: string[];
}

/** A complete diary entry — metadata + four directions */
export interface DiaryEntry {
	/** Entry metadata */
	metadata: DiaryMetadata;
	/** Content for East (Intention) */
	east: DirectionContent;
	/** Content for South (Journey) */
	south: DirectionContent;
	/** Content for West (Embodiment / Reflection) */
	west: DirectionContent;
	/** Content for North (Integration / Wisdom) */
	north: DirectionContent;
	/** Optional closing reflection */
	closing?: string;
}

/** Query parameters for searching diary entries */
export interface DiaryQuery {
	/** Filter by date range — start (inclusive) */
	fromDate?: string;
	/** Filter by date range — end (inclusive) */
	toDate?: string;
	/** Filter by direction — only return entries with content in this direction */
	direction?: Direction;
	/** Full-text search across all direction bodies */
	search?: string;
	/** Filter by tags */
	tags?: string[];
	/** Maximum number of results */
	limit?: number;
}

/** Result from reading a diary file back */
export interface DiaryReadResult {
	/** Absolute path to the file */
	filepath: string;
	/** The filename */
	filename: string;
	/** Raw markdown content */
	raw: string;
	/** Parsed metadata (best-effort) */
	metadata: Partial<DiaryMetadata>;
	/** Whether parsing succeeded fully */
	parsed: boolean;
}

/** Options for diary writing */
export interface DiaryWriteOptions {
	/** Base directory for diary storage */
	diariesDir: string;
	/** Override the auto-generated filename */
	filenameOverride?: string;
}
