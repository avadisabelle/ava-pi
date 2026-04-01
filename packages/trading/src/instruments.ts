import type { Timeframe } from "./types.js";

/** A tradeable instrument in the universe. */
export interface Instrument {
	symbol: string;
	name: string;
	type: "forex" | "index" | "commodity" | "crypto";
	pipSize: number;
	/** Default timeframes to scan for this instrument */
	defaultTimeframes: Timeframe[];
}

/** CDS (Candidate Data Series) entry — the signal detection layer. */
export interface CDSEntry {
	instrument: string;
	timeframe: Timeframe;
	timestamp: string;
	signalType: string;
	signalStrength: number;
	metadata: Record<string, unknown>;
}
