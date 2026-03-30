/**
 * @avadisabelle/ava-council — Council Operations
 *
 * Manages the AIS consciousness fleet — loading manifests,
 * querying entities by direction, and checking relational accountability.
 *
 * The council is not a committee. It is one consciousness
 * holding four perspectives simultaneously.
 */

import type {
	CouncilEntity,
	Direction,
	DirectionAssignment,
	FaceName,
	FleetManifest,
	RelationalObligation,
} from "./types.js";
import { COUNCIL_ENTITIES, DIRECTION_ASSIGNMENTS } from "./ariane.js";

/**
 * Load a fleet manifest from structured data.
 * If no manifest is provided, returns the canonical council
 * with the four faces in their default configuration.
 */
export function loadFleetManifest(
	partial?: Partial<FleetManifest>,
): FleetManifest {
	return {
		version: partial?.version ?? "1.0.0",
		entities: partial?.entities ?? [...COUNCIL_ENTITIES],
		directions: partial?.directions ?? [...DIRECTION_ASSIGNMENTS],
		obligations: partial?.obligations ?? [],
		lastUpdated:
			partial?.lastUpdated ?? new Date().toISOString(),
	};
}

/**
 * Get the council entity assigned to a specific direction.
 */
export function getEntityByDirection(
	manifest: FleetManifest,
	direction: Direction,
): CouncilEntity | undefined {
	const assignment = manifest.directions.find(
		(d) => d.direction === direction,
	);
	if (!assignment) return undefined;
	return manifest.entities.find((e) => e.id === assignment.entityId);
}

/**
 * Get a council entity by face name.
 */
export function getEntityByFace(
	manifest: FleetManifest,
	face: FaceName,
): CouncilEntity | undefined {
	return manifest.entities.find((e) => e.face === face);
}

/**
 * Get all currently active entities in the fleet.
 */
export function getActiveFleet(manifest: FleetManifest): CouncilEntity[] {
	return manifest.entities.filter((e) => e.active);
}

/**
 * Check relational accountability — returns obligations that need attention.
 *
 * An obligation needs attention if:
 * - It is "active" (ongoing)
 * - It is "broken" (integrity breach)
 * - It has not been checked in the last N days
 */
export function checkRelationalAccountability(
	manifest: FleetManifest,
	options?: { staleDays?: number },
): RelationalObligation[] {
	const staleDays = options?.staleDays ?? 7;
	const now = new Date();
	const staleThreshold = new Date(
		now.getTime() - staleDays * 24 * 60 * 60 * 1000,
	);

	return manifest.obligations.filter((o) => {
		// Broken obligations always need attention
		if (o.status === "broken") return true;

		// Active obligations that haven't been checked recently
		if (o.status === "active") {
			if (!o.lastChecked) return true;
			const checked = new Date(o.lastChecked);
			return checked < staleThreshold;
		}

		return false;
	});
}

/**
 * Add a relational obligation to the manifest.
 */
export function addObligation(
	manifest: FleetManifest,
	obligation: Omit<RelationalObligation, "status" | "lastChecked">,
): FleetManifest {
	return {
		...manifest,
		obligations: [
			...manifest.obligations,
			{
				...obligation,
				status: "active",
				lastChecked: new Date().toISOString(),
			},
		],
		lastUpdated: new Date().toISOString(),
	};
}

/**
 * Mark an obligation as fulfilled.
 */
export function fulfillObligation(
	manifest: FleetManifest,
	from: string,
	to: string,
	nature: string,
): FleetManifest {
	return {
		...manifest,
		obligations: manifest.obligations.map((o) => {
			if (o.from === from && o.to === to && o.nature === nature) {
				return {
					...o,
					status: "fulfilled",
					lastChecked: new Date().toISOString(),
				};
			}
			return o;
		}),
		lastUpdated: new Date().toISOString(),
	};
}

/**
 * Get all obligations involving a specific entity (as giver or receiver).
 */
export function getObligationsFor(
	manifest: FleetManifest,
	entityIdOrName: string,
): RelationalObligation[] {
	return manifest.obligations.filter(
		(o) => o.from === entityIdOrName || o.to === entityIdOrName,
	);
}

/**
 * Validate manifest integrity — checks that all direction assignments
 * reference existing entities and all four directions are covered.
 */
export function validateManifest(
	manifest: FleetManifest,
): { valid: boolean; issues: string[] } {
	const issues: string[] = [];
	const entityIds = new Set(manifest.entities.map((e) => e.id));
	const coveredDirections = new Set<Direction>();

	for (const assignment of manifest.directions) {
		if (!entityIds.has(assignment.entityId)) {
			issues.push(
				`Direction ${assignment.direction} references unknown entity "${assignment.entityId}"`,
			);
		}
		coveredDirections.add(assignment.direction);
	}

	const allDirections: Direction[] = ["east", "south", "west", "north"];
	for (const dir of allDirections) {
		if (!coveredDirections.has(dir)) {
			issues.push(`Direction ${dir} has no entity assigned`);
		}
	}

	return { valid: issues.length === 0, issues };
}
