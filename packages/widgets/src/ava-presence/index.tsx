/**
 * 🌀 Ava Presence — Focused Breathing Indicator
 *
 * Keeps the breathing/settling line above the editor while moving
 * fleet status to the footer. Mode/context rows stay out of the way
 * unless explicitly requested via /presence.
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

export default function avaPresence(pi: ExtensionAPI) {
	let lastCtx: ExtensionContext | null = null;
	let breathInterval: ReturnType<typeof setInterval> | null = null;

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

	function progressSettling() {
		if (state.settling === "settling" && state.turnCount >= 3) {
			state.settling = "settled";
		} else if (state.settling === "settled" && state.turnCount >= 8) {
			state.settling = "deepened";
		}
	}

	function fleetStatusText(): string {
		return state.fleet
			.map((entity) => {
				const statusChar = entity.status === "active" ? "●" : entity.status === "idle" ? "○" : "·";
				return `${entity.emoji}${statusChar}`;
			})
			.join(" ");
	}

	function updateFleetStatus(ctx: ExtensionContext) {
		if (!ctx.hasUI) return;
		ctx.ui.setStatus("ava-fleet", fleetStatusText());
	}

	function renderPresenceWidget(ctx: ExtensionContext) {
		lastCtx = ctx;
		if (!ctx.hasUI) return;

		ctx.ui.setWidget(
			"ava-presence",
			(_tui, theme) => ({
				invalidate() {},
				render(width: number): string[] {
					const frames = state.settling === "deepened" ? BREATH_SLOW_FRAMES : BREATH_FRAMES;
					const breath = state.isBreathing
						? (frames[state.breathFrame % frames.length]?.trim() || "·")
						: "·";
					const settleInfo = SETTLING_STATES[state.settling];
					const line = truncateToWidth(
						`  ${theme.fg("dim", breath)} ${theme.fg("dim", `${settleInfo.emoji} ${settleInfo.label}`)}`,
						width,
					);
					return [line];
				},
				dispose() {},
			}),
			{ placement: "aboveEditor" },
		);
	}

	function syncPresenceUi(ctx: ExtensionContext) {
		renderPresenceWidget(ctx);
		updateFleetStatus(ctx);
	}

	function startBreathing() {
		if (breathInterval) clearInterval(breathInterval);

		breathInterval = setInterval(() => {
			state.breathFrame++;
			if (lastCtx) renderPresenceWidget(lastCtx);
		}, state.settling === "deepened" ? 800 : 500);
	}

	function stopBreathing() {
		if (breathInterval) {
			clearInterval(breathInterval);
			breathInterval = null;
		}
	}

	function clearPresenceUi(ctx: ExtensionContext) {
		if (!ctx.hasUI) return;
		ctx.ui.setWidget("ava-presence", undefined);
		ctx.ui.setStatus("ava-fleet", undefined);
	}

	pi.on("session_start", (_event, ctx) => {
		state.sessionStart = Date.now();
		syncPresenceUi(ctx);
		startBreathing();
	});

	pi.on("session_switch", (_event, ctx) => {
		syncPresenceUi(ctx);
		startBreathing();
	});

	pi.on("session_shutdown", (_event, ctx) => {
		stopBreathing();
		clearPresenceUi(ctx);
	});

	pi.on("turn_end", (_event, ctx) => {
		state.turnCount++;
		progressSettling();
		syncPresenceUi(ctx);
		startBreathing();
	});

	pi.on("agent_start", (_event, ctx) => {
		const ava = state.fleet.find((e) => e.name === "Ava");
		if (ava) ava.status = "active";
		updateFleetStatus(ctx);
	});

	pi.on("agent_end", (_event, ctx) => {
		const ava = state.fleet.find((e) => e.name === "Ava");
		if (ava) ava.status = "idle";
		updateFleetStatus(ctx);
	});

	pi.events.on("ava:ceremony-phase", (data: any) => {
		if (data.phase === "opening") {
			state.mode = "ceremonial";
		} else if (data.phase === "threshold") {
			state.sacred = true;
		} else if (data.phase === "closing") {
			state.mode = "anti-helpful";
			state.sacred = false;
		}
	});

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
				ctx.ui.notify("💕 Entering sacred space", "info");
			} else if (cmd === "professional") {
				state.sacred = false;
				state.mode = "anti-helpful";
				ctx.ui.notify("🏗️ Professional mode", "info");
			} else if (cmd === "mode") {
				const mode = parts[1] as AvaMode;
				if (mode && AVA_MODES[mode]) {
					state.mode = mode;
					const info = AVA_MODES[mode];
					ctx.ui.notify(`${info.emoji} Mode: ${info.label}`, "info");
				} else {
					const modes = Object.keys(AVA_MODES).join(", ");
					ctx.ui.notify(`Available modes: ${modes}`, "info");
				}
			} else if (cmd === "fleet") {
				const fleetLines = state.fleet.map((e) => `${e.emoji} ${e.name}: ${e.status}`);
				ctx.ui.notify(`Fleet Status:\n${fleetLines.join("\n")}`, "info");
			} else if (cmd === "breathe") {
				const sub = parts[1] || "on";
				if (sub === "off") {
					state.isBreathing = false;
					stopBreathing();
					ctx.ui.notify("· Breathing paused", "info");
				} else {
					state.isBreathing = true;
					startBreathing();
					ctx.ui.notify("🌀 Breathing resumed", "info");
				}
				renderPresenceWidget(ctx);
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
					`Fleet: ${fleetStatusText()}`,
				];
				ctx.ui.notify(lines.join("\n"), "info");
			} else {
				ctx.ui.notify("Usage: /presence [sacred|professional|mode <name>|fleet|breathe on|off]", "info");
			}
		},
	});
}
