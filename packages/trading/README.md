# @avadisabelle/ava-pi-trading

**Williams 5D trading types, ARIANE trade gate protocol, and garden metaphor for the Ava ecosystem**

This package provides the core type system and pure logic functions for implementing the Williams Method trading approach within the Ava PI ecosystem. It includes:

- **Williams 5 Dimensions**: TypeScript types for the Alligator, Awesome Oscillator (AO), Acceleration/Deceleration (AC), Fractals, and Fractal Divergent Bars (FDB)
- **ARIANE Trade Gate Protocol**: The Three Agreements framework and consensus-driven trade evaluation
- **Garden Metaphor**: Capital-as-soil portfolio health tracking using organic farming imagery
- **Instrument Management**: Tradeable instrument definitions and Candidate Data Series (CDS) entries

## Installation

```bash
npm install @avadisabelle/ava-pi-trading
```

## Quick Start

```typescript
import {
	evaluateGate,
	type ThreeAgreements,
	type TradeVerdict,
	type WilliamsDimensions,
	dimensionsSupportDirection,
} from "@avadisabelle/ava-pi-trading";

// Evaluate the Three Agreements to get a trade verdict
const agreements: ThreeAgreements = {
	trendAlignment: true,
	signalPresence: true,
	gardenCapacity: true,
};

const verdict: TradeVerdict = evaluateGate(agreements);
console.log(verdict); // "ALLOW"

// Check if Williams dimensions support a trade direction
const dims: WilliamsDimensions = {
	instrument: "EUR/USD",
	timeframe: "H1",
	timestamp: new Date().toISOString(),
	alligator: {
		jaw: 1.1000,
		teeth: 1.1010,
		lips: 1.1020,
		sleeping: false,
		direction: "bullish",
		spread: 0.0020,
	},
	ao: { value: 0.0005, trend: "rising", zeroCross: true, consecutiveBars: 3 },
	ac: { value: 0.0002, acceleration: "positive" },
	fractals: {
		highFractal: 1.1050,
		lowFractal: 1.0980,
		highFractalTime: new Date().toISOString(),
		lowFractalTime: new Date().toISOString(),
	},
	zone: "green",
	fdb: {
		direction: "long",
		fractalLevel: 1.0980,
		aoConfirms: true,
		alligatorOpen: true,
		strength: "strong",
		barIndex: 5,
	},
};

const supportsLong = dimensionsSupportDirection(dims, "long");
console.log(supportsLong); // true
```

## API Overview

### Types

- **`TradeDirection`**: `"long" | "short"`
- **`TradeVerdict`**: `"ALLOW" | "WAIT" | "NO_TRADE"`
- **`Timeframe`**: `"M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1" | "W1" | "MN"`
- **`SignalStrength`**: `"strong" | "moderate" | "weak"`
- **`MarketRegime`**: `"trending" | "ranging" | "volatile" | "quiet"`
- **`PatternStage`**: `"seed" | "sprout" | "sapling" | "tree" | "harvest" | "composting"`

### Williams 5D Interfaces

- **`AlligatorState`**: Jaw, teeth, lips, sleeping state, direction, and spread
- **`AOState`**: Awesome Oscillator value, trend, zero cross, and consecutive bars
- **`ACState`**: Acceleration/Deceleration value and acceleration direction
- **`FractalLevels`**: High/low fractal levels and timestamps
- **`FDBSignal`**: Fractal Divergent Bar signal details
- **`Zone`**: Current bar zone (`"green" | "red" | "gray"`)
- **`WilliamsDimensions`**: Complete snapshot of all 5 dimensions

### Trade Gate

- **`ThreeAgreements`**: Trend alignment, signal presence, and garden capacity
- **`FaceVerdict`**: Individual council face verdict
- **`GateAssessment`**: Complete gate assessment output
- **`evaluateGate(agreements)`**: Pure function to evaluate the Three Agreements → verdict
- **`dimensionsSupportDirection(dims, direction)`**: Check if Williams dimensions support a trade direction

### Garden

- **`GardenState`**: Portfolio health metrics using soil/planting metaphor
- **`PatternLifecycle`**: Pattern lifecycle tracking for an instrument
- **`gardenHasCapacity(garden)`**: Check if the garden can accept a new trade
- **`assessWeather(volatility, trendStrength)`**: Determine market regime

### Instruments

- **`Instrument`**: Tradeable instrument definition
- **`CDSEntry`**: Candidate Data Series signal entry

## Relationship to `@avadisabelle/ava-council`

This package depends on `@avadisabelle/ava-council` and uses its `ConsensusResult` type in the `GateAssessment` interface. The council provides the multi-face consensus mechanism that powers the ARIANE trade gate protocol.

## Philosophy: The Three Agreements

The ARIANE gate protocol is built on the principle of **unanimous consent**. All three agreements must hold:

1. **Trend Alignment**: Higher timeframe trend supports the direction
2. **Signal Presence**: A valid entry signal (FDB) exists on the trading timeframe
3. **Garden Capacity**: Capital/risk allows the trade (soil health, planting density)

If all three align → `ALLOW`  
If signal or capacity is missing → `NO_TRADE`  
Otherwise → `WAIT`

## License

MIT © Guillaume JG Isabelle
