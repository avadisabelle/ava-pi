/** Trade direction */
export type TradeDirection = "long" | "short";

/** Trade verdict — the output of the gate protocol */
export type TradeVerdict = "ALLOW" | "WAIT" | "NO_TRADE";

/** Timeframes used in the Williams Method hierarchy */
export type Timeframe = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1" | "W1" | "MN";

/** Signal strength assessment */
export type SignalStrength = "strong" | "moderate" | "weak";

/** Market regime (garden weather) */
export type MarketRegime = "trending" | "ranging" | "volatile" | "quiet";

/** Pattern lifecycle stage (seed → sprout → tree) */
export type PatternStage = "seed" | "sprout" | "sapling" | "tree" | "harvest" | "composting";
