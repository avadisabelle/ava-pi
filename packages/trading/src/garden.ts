import type { MarketRegime, PatternStage } from "./types.js";

/**
 * Garden state — the capital-as-soil metaphor.
 * Tracks portfolio health using organic farming imagery.
 */
export interface GardenState {
	/** Soil health: 0-100 (available margin / total capital) */
	soilHealth: number;
	/** Planting density: open positions vs maximum allowed */
	plantingDensity: number;
	/** Current market regime as weather */
	weather: MarketRegime;
	/** P&L trajectory as growth rate */
	growthRate: number;
	/** Total open positions */
	openPositions: number;
	/** Maximum positions allowed */
	maxPositions: number;
}

/** Pattern lifecycle tracking for a single instrument. */
export interface PatternLifecycle {
	instrument: string;
	timeframe: string;
	stage: PatternStage;
	enteredStageAt: string;
	signals: string[];
	nextMilestone: string;
}

/** Check if the garden has capacity for a new trade. */
export function gardenHasCapacity(garden: GardenState): boolean {
	return garden.soilHealth > 20 && garden.plantingDensity < 0.8 && garden.openPositions < garden.maxPositions;
}

/** Assess garden weather from market conditions. */
export function assessWeather(volatility: number, trendStrength: number): MarketRegime {
	if (volatility > 0.7) return "volatile";
	if (trendStrength > 0.6) return "trending";
	if (volatility < 0.2 && trendStrength < 0.2) return "quiet";
	return "ranging";
}
