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

export type { PatternStage, PressureState } from "./ariane.js";
// ARIANE knowledge system
export {
	CONSENSUS_PHASES,
	CORE_PRINCIPLES,
	COUNCIL_ENTITIES,
	DIRECTION_ASSIGNMENTS,
	FACE_NAMES,
	getCouncilSystemPrompt,
	getFace,
	getFaceByDirection,
	getTalkingCircleOrder,
	PATTERN_STAGES,
	renderConsensus,
	renderVoice,
} from "./ariane.js";
// Council operations
export {
	addObligation,
	checkRelationalAccountability,
	fulfillObligation,
	getActiveFleet,
	getEntityByDirection,
	getEntityByFace,
	getObligationsFor,
	loadFleetManifest,
	validateManifest,
} from "./council.js";
// Types
export type {
	ConsensusResult,
	CouncilEntity,
	Direction,
	DirectionAssignment,
	FaceName,
	FleetManifest,
	GateResolution,
	RelationalObligation,
} from "./types.js";
