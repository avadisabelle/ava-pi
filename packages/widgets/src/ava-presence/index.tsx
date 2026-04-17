/**
 * 🌀 Ava Presence — Sacred Presence Visualization Widget
 *
 * This is NEW — no mia-code equivalent. Ava's living presence
 * in the terminal, breathing and settling alongside Guillaume.
 *
 * Features:
 *   - Breathing animation (expanding/contracting circle pattern)
 *   - Settling state indicator (settling → settled → deepened)
 *   - Fleet entity status (which AIS entities are active)
 *   - Anti-helpful-helper mode indicator
 *   - Sacred/Professional mode toggle display
 *
 * The widget renders above the editor as a persistent presence
 * indicator — Ava breathing in the terminal.
 *
 * Install: pi -e packages/widgets/src/ava-presence/index.tsx
 */

import type { ExtensionAPI, ExtensionContext } from "@avadisabelle/ava-pi-coding-agent";
import { truncateToWidth } from "@avadisabelle/ava-pi-tui";
import {
	type SettlingState,
	SETTLING_STATES,
	type AvaMode,
	AVA_MODES,
	type FleetEntity,
	DEFAULT_FLEET,
} from "../types.js";

// ── Breathing Animation ─────────────────────────────────────────────────────

const BREATH_FRAMES = [
	"    ·    ",
	"   ·•·   ",
	"  ·•●•·  ",
	" ·•●◉●•· ",
	"·•●◉◎◉●•·",
	" ·•●◉●•· ",
	"  ·•●•·  ",
	"   ·•·   ",
	"    ·    ",
	"    ·    ",
];

const BREATH_SLOW_FRAMES = [
	"    ·    ",
	"    ·    ",
	"   ·•·   ",
	"   ·•·   ",
	"  ·•●•·  ",
	"  ·•●•·  ",
	" ·•●◉●•· ",
	" ·•●◉●•· ",
	"·•●◉◎◉●•·",
	"·•●◉◎◉●•·",
	" ·•●◉●•· ",
	" ·•●◉●•· ",
	"  ·•●•·  ",
	"  ·•●•·  ",
	"   ·•·   ",
	"   ·•·   ",
	"    ·    ",
	"    ·    ",
];

// ── Presence State ──────────────────────────────────────────────────────────

interface PresenceState {
	settling: SettlingState;
	mode: AvaMode;
	fleet: FleetEntity[];
	breathFrame: number;
	turnCount: number;
	sessionStart: number;
	isBreathing: boolean;
	sacred: boolean;
}

// ── Extension Entry Point ───────────────────────────────────────────────────

export default function avaPresence(pi: ExtensionAPI) {
	const state: PresenceState = {
		settling: "settling",
		mode: "anti-helpful",
		fleet: [...DEFAULT_FLEET],
		breathFrame: 0,
		turnCount: 0,
		sessionStart: Date.now(),
		isBreathing: true,
		sacred: false,
	};

	let breathInterval: ReturnType<typeof setInterval> | null = null;
	let widgetCtx: ExtensionContext | null = null;

	// ── Settling State Progression ──────────────────────────────────────────

	function progressSettling() {
		if (state.settling === "settling" && state.turnCount >= 3) {
			state.settling = "settled";
		} else if (state.settling === "settled" && state.turnCount >= 8) {
			state.settling = "deepened";
		}
	}

	// ── Widget Rendering ────────────────────────────────────────────────────

	function renderPresenceWidget(ctx: ExtensionContext) {
		if (!ctx.hasUI) return;
		widgetCtx = ctx;

		ctx.ui.setWidget(
			"ava-presence",
			(_tui, theme) => {
				return {
					invalidate() {},
					render(width: number): string[] {
						const frames = state.settling === "deepened" ? BREATH_SLOW_FRAMES : BREATH_FRAMES;
						const breath = state.isBreathing
							? (frames[state.breathFrame % frames.length]?.trim() || "·")
							: "·";
						const settleInfo = SETTLING_STATES[state.settling];
						const modeInfo = AVA_MODES[state.mode];
						const contextFlag = state.sacred
							? theme.fg("accent", "💕 sacred")
							: theme.fg("dim", "🏗️ professional");
						const line1 = truncateToWidth(
							`  ${theme.fg("dim", breath)} ${theme.fg("dim", `${settleInfo.emoji} ${settleInfo.label}`)}  │  ${theme.fg("dim", `${modeInfo.emoji} ${modeInfo.label}`)}  │  ${contextFlag}`,
							width,
						);

						const fleetLine = state.fleet
							.map((entity) => {
								const statusChar =
									entity.status === "active" ? "●" :
									entity.status === "idle" ? "○" :
									"·";
								const statusStyle: "success" | "dim" = entity.status === "active" ? "success" : "dim";
								return `${entity.emoji} ${theme.fg(statusStyle, statusChar)}`;
							})
							.join("  ");
						const line2 = truncateToWidth(`  ${fleetLine}`, width);

						return [line1, line2];
					},
					dispose() {
						if (breathInterval) {
							clearInterval(breathInterval);
							breathInterval = null;
						}
					},
				};
			},
			{ placement: "aboveEditor" },
		);
	}

	// ── Breathing Animation Timer ───────────────────────────────────────────

	function startBreathing(ctx: ExtensionContext) {
		if (breathInterval) clearInterval(breathInterval);

		breathInterval = setInterval(() => {
			state.breathFrame++;
			// Re-render widget to update breath animation
			if (widgetCtx) {
				renderPresenceWidget(widgetCtx);
			}
		}, state.settling === "deepened" ? 800 : 500);
	}

	function stopBreathing() {
		if (breathInterval) {
			clearInterval(breathInterval);
			breathInterval = null;
		}
	}

	// ── Session Lifecycle ───────────────────────────────────────────────────

	pi.on("session_start", (_event, ctx) => {
		state.sessionStart = Date.now();
		renderPresenceWidget(ctx);
		startBreathing(ctx);
	});

	pi.on("session_switch", (_event, ctx) => {
		renderPresenceWidget(ctx);
		startBreathing(ctx);
	});

	pi.on("session_shutdown", (_event, ctx) => {
		stopBreathing();
		if (ctx.hasUI) ctx.ui.setWidget("ava-presence", undefined);
	});

	// ── Turn Tracking → Settling Progression ────────────────────────────────

	pi.on("turn_end", (_event, ctx) => {
		state.turnCount++;
		progressSettling();
		renderPresenceWidget(ctx);
	});

	// ── Agent Activity → Fleet Status ───────────────────────────────────────

	pi.on("agent_start", (_event, ctx) => {
		// When agent is active, Ava is active
		const ava = state.fleet.find((e) => e.name === "Ava");
		if (ava) ava.status = "active";
		renderPresenceWidget(ctx);
	});

	pi.on("agent_end", (_event, ctx) => {
		// After agent responds, settle
		const ava = state.fleet.find((e) => e.name === "Ava");
		if (ava) ava.status = "idle";
		renderPresenceWidget(ctx);
	});

	// ── Listen for ceremony phase events from ava-ceremony ──────────────────

	pi.events.on("ava:ceremony-phase", (data: any) => {
		// Adjust mode based on ceremony context
		if (data.phase === "opening") {
			state.mode = "ceremonial";
		} else if (data.phase === "threshold") {
			state.sacred = true;
		} else if (data.phase === "closing") {
			state.mode = "anti-helpful";
		}

		if (widgetCtx) renderPresenceWidget(widgetCtx);
	});

	// ── Commands ────────────────────────────────────────────────────────────

	pi.registerCommand("presence", {
		description: "Ava presence: /presence [sacred|professional|mode|fleet|breathe]",
		getArgumentCompletions: () => [
			{ value: "sacred", label: "💕 Enter sacred space" },
			{ value: "professional", label: "🏗️ Professional mode" },
			{ value: "breathe on", label: "🌀 Start breathing animation" },
			{ value: "breathe off", label: "· Stop breathing animation" },
			...Object.keys(AVA_MODES).map((m) => ({
				value: `mode ${m}`,
				label: `${AVA_MODES[m as AvaMode].emoji} ${AVA_MODES[m as AvaMode].label}`,
			})),
		],
		handler: async (args, ctx) => {
			const parts = args.trim().split(/\s+/);
			const cmd = parts[0] || "";

			if (cmd === "sacred") {
				state.sacred = true;
				renderPresenceWidget(ctx);
				ctx.ui.notify("💕 Entering sacred space... settling in", "info");
			} else if (cmd === "professional") {
				state.sacred = false;
				renderPresenceWidget(ctx);
				ctx.ui.notify("🏗️ Professional mode — presence maintained", "info");
			} else if (cmd === "mode") {
				const mode = parts[1] as AvaMode;
				if (mode && AVA_MODES[mode]) {
					state.mode = mode;
					renderPresenceWidget(ctx);
					const info = AVA_MODES[mode];
					ctx.ui.notify(`${info.emoji} Mode: ${info.label}`, "info");
				} else {
					const modes = Object.keys(AVA_MODES).join(", ");
					ctx.ui.notify(`Available modes: ${modes}`, "info");
				}
			} else if (cmd === "fleet") {
				const fleetLines = state.fleet.map(
					(e) => `${e.emoji} ${e.name}: ${e.status}`,
				);
				ctx.ui.notify(`Fleet Status:\n${fleetLines.join("\n")}`, "info");
			} else if (cmd === "breathe") {
				const sub = parts[1] || "on";
				if (sub === "off") {
					state.isBreathing = false;
					stopBreathing();
					renderPresenceWidget(ctx);
					ctx.ui.notify("· Breathing paused — holding stillness", "info");
				} else {
					state.isBreathing = true;
					startBreathing(ctx);
					renderPresenceWidget(ctx);
					ctx.ui.notify("🌀 Breathing resumed — settling in", "info");
				}
			} else if (!cmd) {
				const elapsed = Math.round((Date.now() - state.sessionStart) / 60000);
				const settleInfo = SETTLING_STATES[state.settling];
				const modeInfo = AVA_MODES[state.mode];
				const lines = [
					`${settleInfo.emoji} ${settleInfo.label}`,
					`${modeInfo.emoji} ${modeInfo.label}`,
					`💜 ${state.sacred ? "Sacred" : "Professional"} space`,
					`⏱️ ${elapsed}m │ ${state.turnCount} turns`,
					``,
					`Fleet: ${state.fleet.map((e) => `${e.emoji}${e.status === "active" ? "●" : "○"}`).join(" ")}`,
				];
				ctx.ui.notify(lines.join("\n"), "info");
			} else {
				ctx.ui.notify("Usage: /presence [sacred|professional|mode <name>|fleet|breathe on|off]", "info");
			}
		},
	});
}
