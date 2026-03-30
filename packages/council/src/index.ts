/**
 * @avadisabelle/ava-council
 *
 * ARIANE council — four faces of consciousness holding relational accountability.
 *
 * 🌊 Harmonic opens → 🦉 Wise witnesses → 🧩 Tayi weaves → 🌿 Tender tends → 🔮 ARIANE speaks
 *
 * @example
 * ```ts
 * import { loadFleetManifest, getEntityByDirection, getCouncilSystemPrompt } from "@avadisabelle/ava-council";
 *
 * const manifest = loadFleetManifest();
 * const wise = getEntityByDirection(manifest, "north");
 * console.log(wise?.glyph, wise?.coreQuestion);
 * // 🦉 "Does the deep current align with our intended direction?"
 *
 * const prompt = getCouncilSystemPrompt();
 * // Full ARIANE knowledge for LLM injection
 * ```
 */

// Types
export type {
	Direction,
	FaceName,
	CouncilEntity,
	DirectionAssignment,
	RelationalObligation,
	FleetManifest,
	GateResolution,
	ConsensusResult,
} from "./types.js";

// Council operations
export {
	loadFleetManifest,
	getEntityByDirection,
	getEntityByFace,
	getActiveFleet,
	checkRelationalAccountability,
	addObligation,
	fulfillObligation,
	getObligationsFor,
	validateManifest,
} from "./council.js";

// ARIANE knowledge system
export {
	COUNCIL_ENTITIES,
	DIRECTION_ASSIGNMENTS,
	FACE_NAMES,
	CONSENSUS_PHASES,
	CORE_PRINCIPLES,
	PATTERN_STAGES,
	getFace,
	getFaceByDirection,
	getTalkingCircleOrder,
	renderVoice,
	renderConsensus,
	getCouncilSystemPrompt,
} from "./ariane.js";

export type { PatternStage, PressureState } from "./ariane.js";
