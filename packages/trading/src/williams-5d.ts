import type { SignalStrength, Timeframe, TradeDirection } from "./types.js";

/**
 * Alligator indicator state.
 * The Alligator's jaw, teeth, and lips determine trend state.
 */
export interface AlligatorState {
	jaw: number;
	teeth: number;
	lips: number;
	sleeping: boolean;
	direction: "bullish" | "bearish" | "neutral";
	/** Distance between jaw and lips — wider = stronger trend */
	spread: number;
}

/**
 * Awesome Oscillator (AO) state.
 * Measures market momentum as the difference between 5-period and 34-period SMAs.
 */
export interface AOState {
	value: number;
	trend: "rising" | "falling" | "flat";
	/** Whether AO crossed zero recently */
	zeroCross: boolean;
	/** Number of consecutive same-color bars */
	consecutiveBars: number;
}

/**
 * Acceleration/Deceleration Oscillator (AC) state.
 * Measures acceleration of momentum change.
 */
export interface ACState {
	value: number;
	acceleration: "positive" | "negative";
}

/**
 * Fractal levels — key support/resistance markers.
 */
export interface FractalLevels {
	highFractal: number | null;
	lowFractal: number | null;
	/** Recent fractal formation timestamps */
	highFractalTime: string | null;
	lowFractalTime: string | null;
}

/**
 * Fractal Divergent Bar (FDB) — the primary entry signal in Williams Method.
 * An FDB occurs when a fractal forms with divergent momentum.
 */
export interface FDBSignal {
	direction: TradeDirection;
	fractalLevel: number;
	aoConfirms: boolean;
	alligatorOpen: boolean;
	strength: SignalStrength;
	/** Bar index where the FDB was detected */
	barIndex: number;
}

/** Zone — the coloring of the current bar based on AO + AC alignment. */
export type Zone = "green" | "red" | "gray";

/**
 * Complete Williams 5 Dimensions snapshot for an instrument/timeframe.
 */
export interface WilliamsDimensions {
	instrument: string;
	timeframe: Timeframe;
	timestamp: string;
	alligator: AlligatorState;
	ao: AOState;
	ac: ACState;
	fractals: FractalLevels;
	zone: Zone;
	fdb: FDBSignal | null;
}
