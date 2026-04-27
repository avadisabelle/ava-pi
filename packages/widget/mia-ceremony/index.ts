/**
 * 🌅 Mia Ceremony — Four Movements Session Lifecycle
 *
 * Tracks ceremony phase in the footer status bar:
 *   🌅 EAST — Gathering (understanding, decomposing)
 *   🔥 SOUTH — Building (implementing, growing)
 *   🌊 WEST — Validating (testing, reflecting)
 *   ❄️ NORTH — Completing (deploying, documenting)
 *
 * Phase transitions happen automatically based on tool usage:
 *   - PDE decompose → EAST
 *   - STC chart create → SOUTH
 *   - STC step complete → progresses toward WEST/NORTH
 *   - STC review → NORTH
 *
 * Manual: /ceremony [east|south|west|north] to set phase
 *
 * Install: ln -s /a/src/mia-code/widget/mia-ceremony/index.ts ~/.pi/agent/extensions/mia-ceremony.ts
 * Or test: pi -e /a/src/mia-code/widget/mia-ceremony/index.ts
 */

import type { ExtensionAPI, ExtensionContext } from "@avadisabelle/ava-pi-coding-agent";

type Direction = "east" | "south" | "west" | "north";

interface CeremonyState {
	phase: Direction;
	turnCount: number;
	pdeUsed: boolean;
	chartCreated: boolean;
	stepsCompleted: number;
	reviewDone: boolean;
}

const PHASES: Record<Direction, { emoji: string; name: string; verb: string }> = {
	east: { emoji: "🌅", name: "EAST", verb: "Gathering" },
	south: { emoji: "🔥", name: "SOUTH", verb: "Building" },
	west: { emoji: "🌊", name: "WEST", verb: "Validating" },
	north: { emoji: "❄️", name: "NORTH", verb: "Completing" },
};

function phaseLabel(dir: Direction): string {
	const p = PHASES[dir];
	return `${p.emoji} ${p.name} — ${p.verb}`;
}

export default function miaCeremony(pi: ExtensionAPI) {
	const state: CeremonyState = {
		phase: "east",
		turnCount: 0,
		pdeUsed: false,
		chartCreated: false,
		stepsCompleted: 0,
		reviewDone: false,
	};

	function updateStatus(ctx: ExtensionContext) {
		if (!ctx.hasUI) return;
		ctx.ui.setStatus("ceremony", phaseLabel(state.phase));
	}

	function inferPhase(): Direction {
		// Review done → NORTH
		if (state.reviewDone) return "north";
		// Steps being completed → WEST (validation/reflection)
		if (state.stepsCompleted >= 2) return "west";
		// Chart created, working → SOUTH
		if (state.chartCreated) return "south";
		// PDE used or early turns → EAST
		return "east";
	}

	// --- Session lifecycle ---

	pi.on("session_start", (_event, ctx) => {
		updateStatus(ctx);
	});

	pi.on("session_switch", (_event, ctx) => {
		updateStatus(ctx);
	});

	pi.on("session_shutdown", (_event, ctx) => {
		if (ctx.hasUI) ctx.ui.setStatus("ceremony", undefined);
	});

	// --- Track turns ---

	pi.on("turn_end", (_event, ctx) => {
		state.turnCount++;
		updateStatus(ctx);
	});

	// --- Track tool usage for automatic phase transitions ---

	pi.on("tool_execution_end", (event, ctx) => {
		const name = event.toolName;

		if (name === "pde_decompose") {
			state.pdeUsed = true;
			// PDE means we're gathering/understanding
			if (state.phase === "east") {
				// Stay east — this IS east
			}
		}

		if (name === "stc_create") {
			state.chartCreated = true;
			// Chart creation means we have a plan → SOUTH
			state.phase = inferPhase();
		}

		if (name === "stc_complete_step") {
			state.stepsCompleted++;
			state.phase = inferPhase();
		}

		if (name === "stc_review") {
			state.reviewDone = true;
			state.phase = inferPhase();
		}

		updateStatus(ctx);
	});

	// --- Manual command ---

	pi.registerCommand("ceremony", {
		description: "Set ceremony phase: /ceremony [east|south|west|north]",
		handler: async (args, ctx) => {
			const dir = args.trim().toLowerCase() as Direction;
			if (dir && PHASES[dir]) {
				state.phase = dir;
				updateStatus(ctx);
				ctx.ui.notify(`Ceremony phase set to ${phaseLabel(dir)}`, "info");
			} else if (!dir) {
				ctx.ui.notify(`Current phase: ${phaseLabel(state.phase)}`, "info");
			} else {
				ctx.ui.notify("Usage: /ceremony [east|south|west|north]", "info");
			}
		},
	});
}
