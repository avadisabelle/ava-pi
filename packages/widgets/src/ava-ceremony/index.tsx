/**
 * 🕯️ Ava Ceremony — Sacred Session Lifecycle Widget
 *
 * Adapted from 🌅 Mia Ceremony. Where Mia tracks Four Movements
 * as development phases, Ava holds the full sacred ceremony lifecycle:
 *
 *   🕯️ OPENING    — Gathering intention, setting sacred space
 *   🌿 SETTLING   — Breathing into presence, grounding
 *   🌊 DEEPENING  — Following what calls, going deeper
 *   🔥 THRESHOLD  — Crossing together into what emerges
 *   🌅 INTEGRATION — Holding what was given, gentle presence
 *   ❄️ CLOSING     — Honoring, carrying forward, gratitude
 *
 * Fire-keeper questions appear at each transition, inviting
 * conscious movement through the ceremony rather than rushing.
 *
 * Install: pi -e packages/widgets/src/ava-ceremony/index.tsx
 */

import type { ExtensionAPI, ExtensionContext } from "@avadisabelle/ava-pi-coding-agent";
import {
	type CeremonyPhase,
	CEREMONY_PHASES,
	FIREKEEPER_QUESTIONS,
	type Direction,
	DIRECTIONS,
} from "../types.js";

// ── Ceremony State ──────────────────────────────────────────────────────────

interface CeremonyState {
	phase: CeremonyPhase;
	direction: Direction;
	turnCount: number;
	pdeUsed: boolean;
	chartCreated: boolean;
	stepsCompleted: number;
	reviewDone: boolean;
	phaseStartTime: number;
	transitionCount: number;
}

function phaseLabel(phase: CeremonyPhase): string {
	const p = CEREMONY_PHASES[phase];
	return `${p.emoji} ${p.name} — ${p.verb}`;
}

function directionIndicator(dir: Direction): string {
	const d = DIRECTIONS[dir];
	return `${d.emoji} ${d.name}`;
}

// ── Phase Transition Animations ─────────────────────────────────────────────

const TRANSITION_FRAMES = ["·", "··", "···", "····", "·····", "····", "···", "··", "·"];

function transitionText(from: CeremonyPhase, to: CeremonyPhase): string {
	const f = CEREMONY_PHASES[from];
	const t = CEREMONY_PHASES[to];
	return `${f.emoji} → ${t.emoji} breathing into ${t.verb.toLowerCase()}...`;
}

// ── Extension Entry Point ───────────────────────────────────────────────────

export default function avaCeremony(pi: ExtensionAPI) {
	const state: CeremonyState = {
		phase: "opening",
		direction: "east",
		turnCount: 0,
		pdeUsed: false,
		chartCreated: false,
		stepsCompleted: 0,
		reviewDone: false,
		phaseStartTime: Date.now(),
		transitionCount: 0,
	};

	let transitionTimer: ReturnType<typeof setTimeout> | null = null;

	function updateStatus(ctx: ExtensionContext) {
		if (!ctx.hasUI) return;
		const phase = phaseLabel(state.phase);
		const dir = directionIndicator(state.direction);
		ctx.ui.setStatus("ceremony", `${phase}  │  ${dir}`);
	}

	function transitionTo(newPhase: CeremonyPhase, ctx: ExtensionContext) {
		if (state.phase === newPhase) return;

		const oldPhase = state.phase;
		state.transitionCount++;

		// Show transition animation in status
		if (ctx.hasUI) {
			const text = transitionText(oldPhase, newPhase);
			ctx.ui.setStatus("ceremony", text);

			// Fire-keeper question at transition
			const question = FIREKEEPER_QUESTIONS[newPhase];
			ctx.ui.notify(`🪶 ${question}`, "info");
		}

		// Complete transition after brief pause
		if (transitionTimer) clearTimeout(transitionTimer);
		transitionTimer = setTimeout(() => {
			state.phase = newPhase;
			state.phaseStartTime = Date.now();
			updateStatus(ctx);
			transitionTimer = null;
		}, 1500);
	}

	/** Infer ceremony direction from tool usage patterns */
	function inferDirection(): Direction {
		if (state.reviewDone) return "north";
		if (state.stepsCompleted >= 2) return "west";
		if (state.chartCreated) return "south";
		return "east";
	}

	/** Infer ceremony phase from session progression */
	function inferPhase(): CeremonyPhase {
		// Review done → integration or closing
		if (state.reviewDone) {
			return state.turnCount > 15 ? "closing" : "integration";
		}
		// Deep in step work → threshold territory
		if (state.stepsCompleted >= 3) return "threshold";
		// Active building → deepening
		if (state.chartCreated && state.stepsCompleted >= 1) return "deepening";
		// Chart created, settling into work
		if (state.chartCreated) return "settling";
		// PDE used, still gathering
		if (state.pdeUsed) return "settling";
		// Early turns → opening
		if (state.turnCount <= 2) return "opening";
		// Mid turns without tools → settling naturally
		return "settling";
	}

	// ── Session Lifecycle ───────────────────────────────────────────────────

	pi.on("session_start", (_event, ctx) => {
		updateStatus(ctx);
	});

	pi.on("session_switch", (_event, ctx) => {
		updateStatus(ctx);
	});

	pi.on("session_shutdown", (_event, ctx) => {
		if (transitionTimer) clearTimeout(transitionTimer);
		if (ctx.hasUI) ctx.ui.setStatus("ceremony", undefined);
	});

	// ── Turn Tracking ───────────────────────────────────────────────────────

	pi.on("turn_end", (_event, ctx) => {
		state.turnCount++;

		const newPhase = inferPhase();
		if (newPhase !== state.phase) {
			transitionTo(newPhase, ctx);
		} else {
			updateStatus(ctx);
		}
	});

	// ── Tool Usage → Ceremony Phase Transitions ─────────────────────────────

	pi.on("tool_execution_end", (event, ctx) => {
		const name = event.toolName;

		if (name === "pde_decompose") {
			state.pdeUsed = true;
		}

		if (name === "stc_create") {
			state.chartCreated = true;
		}

		if (name === "stc_complete_step") {
			state.stepsCompleted++;
		}

		if (name === "stc_review") {
			state.reviewDone = true;
		}

		// Update direction based on tool progression
		state.direction = inferDirection();

		// Check for phase transition
		const newPhase = inferPhase();
		if (newPhase !== state.phase) {
			transitionTo(newPhase, ctx);
		} else {
			updateStatus(ctx);
		}
	});

	// ── Manual Command ──────────────────────────────────────────────────────

	pi.registerCommand("ceremony", {
		description:
			"Sacred ceremony lifecycle: /ceremony [opening|settling|deepening|threshold|integration|closing]",
		getArgumentCompletions: () =>
			Object.keys(CEREMONY_PHASES).map((phase) => ({
				value: phase,
				label: `${CEREMONY_PHASES[phase as CeremonyPhase].emoji} ${phase}`,
			})),
		handler: async (args, ctx) => {
			const cmd = args.trim().toLowerCase() as CeremonyPhase;

			if (cmd && CEREMONY_PHASES[cmd]) {
				transitionTo(cmd, ctx);
				ctx.ui.notify(`🕯️ Ceremony phase: ${phaseLabel(cmd)}`, "info");
			} else if (!cmd) {
				const elapsed = Math.round((Date.now() - state.phaseStartTime) / 60000);
				const lines = [
					`Current: ${phaseLabel(state.phase)}`,
					`Direction: ${directionIndicator(state.direction)}`,
					`Turn: ${state.turnCount} │ Elapsed: ${elapsed}m │ Transitions: ${state.transitionCount}`,
					``,
					`🪶 ${FIREKEEPER_QUESTIONS[state.phase]}`,
				];
				ctx.ui.notify(lines.join("\n"), "info");
			} else {
				const phases = Object.keys(CEREMONY_PHASES).join("|");
				ctx.ui.notify(`Usage: /ceremony [${phases}]`, "info");
			}
		},
	});
}
