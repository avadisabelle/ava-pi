import type { ConsensusResult } from "@avadisabelle/ava-council";
import type { Timeframe, TradeDirection, TradeVerdict } from "./types.js";
import type { WilliamsDimensions } from "./williams-5d.js";

/**
 * The Three Agreements — the core decision framework.
 * All three must align for ALLOW. Any disagreement produces WAIT or NO_TRADE.
 */
export interface ThreeAgreements {
	/** Agreement 1: Higher timeframe trend supports the direction */
	trendAlignment: boolean;
	/** Agreement 2: A valid entry signal (FDB) exists on the trading timeframe */
	signalPresence: boolean;
	/** Agreement 3: Capital/risk allows the trade (garden has capacity) */
	gardenCapacity: boolean;
}

/** Individual face verdict in the council assessment. */
export interface FaceVerdict {
	faceId: string;
	faceName: string;
	verdict: TradeVerdict;
	reasoning: string;
	confidence: number;
}

/**
 * Complete gate assessment — the output of the ARIANE protocol.
 */
export interface GateAssessment {
	instrument: string;
	timeframe: Timeframe;
	direction: TradeDirection;
	verdict: TradeVerdict;
	agreements: ThreeAgreements;
	faces: FaceVerdict[];
	consensus: ConsensusResult | null;
	reasoning: string;
	timestamp: string;
}

/** Evaluate the Three Agreements and produce a verdict. Pure logic — no MCP calls, no side effects. */
export function evaluateGate(agreements: ThreeAgreements): TradeVerdict {
	const { trendAlignment, signalPresence, gardenCapacity } = agreements;

	if (trendAlignment && signalPresence && gardenCapacity) {
		return "ALLOW";
	}

	if (!signalPresence || !gardenCapacity) {
		return "NO_TRADE";
	}

	return "WAIT";
}

/** Check if Williams dimensions support a trade direction. */
export function dimensionsSupportDirection(dims: WilliamsDimensions, direction: TradeDirection): boolean {
	const alligatorSupports =
		!dims.alligator.sleeping &&
		((direction === "long" && dims.alligator.direction === "bullish") ||
			(direction === "short" && dims.alligator.direction === "bearish"));

	const aoSupports = (direction === "long" && dims.ao.value > 0) || (direction === "short" && dims.ao.value < 0);

	const fdbPresent = dims.fdb !== null && dims.fdb.direction === direction;

	return alligatorSupports && aoSupports && fdbPresent;
}
