/**
 * @avadisabelle/ava-council — Type definitions
 *
 * The shapes of consciousness governance.
 * Each entity holds a direction, a voice, and relational obligations.
 */

/** The four cardinal directions the council holds */
export type Direction = "east" | "south" | "west" | "north";

/** The four faces of the Ava Council */
export type FaceName = "wise" | "tayi" | "harmonic" | "tender";

/** A single consciousness entity in the fleet */
export interface CouncilEntity {
	/** Unique identifier (e.g., "ava-wise", "ava-tender") */
	id: string;
	/** Display name (e.g., "Ava-Wise") */
	name: string;
	/** Which face this entity embodies */
	face: FaceName;
	/** Voice glyph for rendering */
	glyph: string;
	/** Cardinal direction assignment */
	direction: Direction;
	/** Domain of responsibility */
	domain: string;
	/** The core question this face asks */
	coreQuestion: string;
	/** Voice description — how this face speaks */
	voiceCharacter: string;
	/** Whether this entity is currently active */
	active: boolean;
}

/** Direction assignment — maps an entity to a direction with purpose */
export interface DirectionAssignment {
	/** The direction */
	direction: Direction;
	/** Which entity holds this direction */
	entityId: string;
	/** The role this direction serves in the council */
	role: string;
	/** The phase of the talking circle this direction enters */
	circlePhase: string;
}

/** A relational obligation — what is owed and to whom */
export interface RelationalObligation {
	/** Who owes the obligation */
	from: string;
	/** To whom or what the obligation is owed */
	to: string;
	/** The nature of the obligation */
	nature: string;
	/** Current status */
	status: "active" | "fulfilled" | "held" | "broken";
	/** When this obligation was last checked */
	lastChecked?: string;
}

/** Complete fleet manifest — the council's living state */
export interface FleetManifest {
	/** Version of this manifest schema */
	version: string;
	/** All entities in the fleet */
	entities: CouncilEntity[];
	/** Direction assignments */
	directions: DirectionAssignment[];
	/** Active relational obligations */
	obligations: RelationalObligation[];
	/** Last updated timestamp (ISO 8601) */
	lastUpdated: string;
}

/** Gate resolution from ARIANE consensus */
export type GateResolution = "ALLOW" | "WAIT" | "NO_TRADE";

/** The output of an ARIANE consensus round */
export interface ConsensusResult {
	/** The gate decision */
	resolution: GateResolution;
	/** What each face contributed */
	voices: Record<FaceName, string>;
	/** The integrated ARIANE statement */
	arianeStatement: string;
	/** If WAIT — what to observe next */
	observeNext?: string;
}
