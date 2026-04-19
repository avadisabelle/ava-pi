/**
 * 🔧 Ava Tools — Ceremony-Aware PDE + STC Extension
 *
 * Adapted from 🔧 Mia Tools. Where Mia registers tools as engineering
 * instruments, Ava wraps them in ceremonial awareness:
 *
 *   - PDE as ceremony opening (decomposition is gathering intention)
 *   - STC as structural tension navigation (outcome ↔ reality as creative space)
 *   - Four Directions mapping surfaced in tool output
 *   - Ceremony-aware tool gating (tools suggest appropriate ceremony phases)
 *
 * Same tool surface (pde_decompose, stc_create, stc_add_step,
 * stc_complete_step, stc_review, stc_list) but with sacred framing.
 *
 * Install: pi -e packages/widgets/src/ava-tools/index.tsx
 */

import { Type } from "@avadisabelle/ava-pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@avadisabelle/ava-pi-coding-agent";
import { Box, Text } from "@avadisabelle/ava-pi-tui";
import { spawn } from "child_process";
import { createRequire } from "module";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join } from "path";
import { showFileViewer } from "../lib/file-viewer.js";
import { DIRECTIONS, type Direction, CEREMONY_PHASES, type CeremonyPhase } from "../types.js";

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolve the miaco binary from the published mia-co npm package.
 * Falls back to a global `miaco` command if the package is not found locally.
 */
function resolveMiacoBin(): string {
	const require = createRequire(import.meta.url);
	try {
		// mia-co package declares bin.miaco -> dist/index.js
		const pkgPath = require.resolve("mia-co/package.json");
		return join(dirname(pkgPath), "dist", "index.js");
	} catch {
		// Fallback: assume miaco is available globally
		return "miaco";
	}
}

const MIACO_BIN = resolveMiacoBin();

function sessionIdFromCwd(cwd: string): string {
	const parts = cwd.replace(/\/+$/, "").split("/");
	const slug = parts.slice(-2).join("_").replace(/[^a-zA-Z0-9_-]/g, "");
	let hash = 0;
	for (let i = 0; i < cwd.length; i++) {
		hash = ((hash << 5) - hash + cwd.charCodeAt(i)) | 0;
	}
	return `ava_${slug}_${Math.abs(hash).toString(36)}`;
}

function runMiaco(args: string[], cwd: string): Promise<{ stdout: string; stderr: string; code: number }> {
	const sessionId = sessionIdFromCwd(cwd);
	const isChart = args[0] === "chart";
	const fullArgs = isChart ? [...args, "--session", sessionId] : [...args];
	const isAbsolutePath = MIACO_BIN.startsWith("/") || MIACO_BIN.includes("\\");
	const cmd = isAbsolutePath ? "node" : MIACO_BIN;
	const cmdArgs = isAbsolutePath ? [MIACO_BIN, ...fullArgs] : fullArgs;
	return new Promise((resolve) => {
		const child = spawn(cmd, cmdArgs, {
			cwd,
			stdio: ["ignore", "pipe", "pipe"],
			env: process.env,
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
		child.stderr.on("data", (d: Buffer) => (stderr += d.toString()));
		child.on("close", (code) => resolve({ stdout, stderr, code: code ?? 1 }));
		child.on("error", (err) => resolve({ stdout: "", stderr: err.message, code: 1 }));
	});
}

function parseJson(stdout: string): any {
	try {
		return JSON.parse(stdout.trim());
	} catch {
		return null;
	}
}

/**
 * List PDE decompositions from .pde/ directory.
 * Supports both formats:
 *   - v2.1 folder: .pde/<yyMMddHHmm>--<uuid>/pde-<uuid>.json
 *   - legacy flat:  .pde/<uuid>.json
 */
function listPdeFiles(cwd: string): any[] {
	const dir = join(cwd, ".pde");
	if (!existsSync(dir)) return [];

	const results: any[] = [];

	for (const entry of readdirSync(dir)) {
		const fullPath = join(dir, entry);
		try {
			const stat = statSync(fullPath);

			if (stat.isDirectory()) {
				// v2.1 folder format: look for pde-<uuid>.json inside
				for (const child of readdirSync(fullPath)) {
					if (child.startsWith("pde-") && child.endsWith(".json")) {
						const parsed = JSON.parse(readFileSync(join(fullPath, child), "utf-8"));
						results.push(parsed);
					}
				}
			} else if (entry.endsWith(".json")) {
				// Legacy flat format
				const parsed = JSON.parse(readFileSync(fullPath, "utf-8"));
				results.push(parsed);
			}
		} catch {
			// Skip malformed entries
		}
	}

	// Sort by timestamp descending, limit to 10
	results.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
	return results.slice(0, 10);
}

// ── Ceremony-Aware Direction Mapping ────────────────────────────────────────

const TOOL_CEREMONY_MAP: Record<string, { direction: Direction; phase: CeremonyPhase; verb: string }> = {
	pde_decompose: { direction: "east", phase: "opening", verb: "gathering intention" },
	stc_create: { direction: "south", phase: "settling", verb: "creating structural tension" },
	stc_add_step: { direction: "south", phase: "deepening", verb: "building the path" },
	stc_complete_step: { direction: "west", phase: "deepening", verb: "embodying the work" },
	stc_review: { direction: "north", phase: "integration", verb: "reflecting on what emerged" },
	stc_list: { direction: "north", phase: "integration", verb: "surveying the territory" },
};

function ceremonialToolLabel(toolName: string): string {
	const mapping = TOOL_CEREMONY_MAP[toolName];
	if (!mapping) return "";
	const dir = DIRECTIONS[mapping.direction];
	return `${dir.emoji} ${mapping.verb}`;
}

// ── Extension Entry Point ───────────────────────────────────────────────────

export default function avaTools(pi: ExtensionAPI) {
	// Track last PDE ID for parent chaining across tools
	let lastPdeId: string | null = null;

	// Listen for PDE completions from interceptor or direct tool calls
	pi.events.on("ava:pde-complete", (data: any) => {
		if (data?.id) lastPdeId = data.id;
	});

	// Emit ceremony phase hints when tools execute
	pi.on("tool_execution_start", (event, ctx) => {
		const mapping = TOOL_CEREMONY_MAP[event.toolName];
		if (mapping && ctx.hasUI) {
			ctx.ui.setStatus("ava-tools", ceremonialToolLabel(event.toolName));
		}
	});

	pi.on("tool_execution_end", (_event, ctx) => {
		if (ctx.hasUI) {
			ctx.ui.setStatus("ava-tools", undefined);
		}
	});

	// ── Tool: pde_decompose (ceremony opening) ──────────────────────────────

	pi.registerTool({
		name: "pde_decompose",
		label: "🌅 PDE — Gathering Intention",
		description:
			"Decompose a complex prompt into structured intents using the Prompt Decomposition Engine. " +
			"Returns primary/secondary intents, Four Directions mapping, action stack, and ambiguity flags. " +
			"This is the ceremony opening — gathering intention before action. " +
			"Use when a request contains multiple implicit goals or complex multi-step work.",
		promptSnippet: "Decompose complex prompts into structured intents with Four Directions mapping",
		promptGuidelines: [
			"Use PDE at the beginning of complex tasks — it is the ceremony opening",
			"The Four Directions mapping helps orient which direction the work flows",
			"After decomposition, consider creating an STC chart for structural tension",
		],
		parameters: Type.Object({
			prompt: Type.String({ description: "The complex prompt to decompose" }),
			engine: Type.Optional(
				Type.Union([Type.Literal("claude"), Type.Literal("gemini"), Type.Literal("copilot")], {
					description: "LLM engine for decomposition (default: claude)",
				}),
			),
			parent: Type.Optional(
				Type.String({ description: "Parent PDE UUID for nesting child decompositions under a parent" }),
			),
		}),

		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const engine = params.engine || "claude";
			const args = ["decompose", "run", "-e", engine, "-p", params.prompt, "--json"];
			if (params.parent) args.push("--parent", params.parent);
			const result = await runMiaco(args, ctx.cwd);

			if (result.code !== 0) {
				return {
					content: [{ type: "text", text: `🕯️ PDE gathering failed: ${result.stderr || result.stdout}` }],
					isError: true,
					details: undefined,
				};
			}

			const parsed = parseJson(result.stdout);
			if (!parsed) {
				return {
					content: [{ type: "text", text: `PDE produced unparseable output:\n${result.stdout}` }],
					isError: true,
					details: undefined,
				};
			}

			// Track PDE ID for parent chaining
			if (parsed.id) {
				lastPdeId = parsed.id;
				pi.events.emit("ava:pde-complete", {
					id: parsed.id,
					parent: params.parent || null,
					markdownPath: parsed.markdownPath || null,
				});
			}

			const mdPath = parsed.markdownPath;
			let markdown = "";
			if (mdPath && existsSync(mdPath)) {
				markdown = readFileSync(mdPath, "utf-8");
				if (ctx.hasUI) {
					const review = await showFileViewer(ctx, {
						filePath: mdPath,
						title: "PDE Review",
						editable: true,
					});
					markdown = review.content;
				}
			}

			return {
				content: [
					{
						type: "text",
						text: markdown || JSON.stringify(parsed.result || parsed, null, 2),
					},
				],
				details: parsed,
			};
		},

		renderResult(result, { expanded }, theme) {
			const details = result.details as any;
			if (!details?.result) return undefined;

			const r = details.result;
			const lines: string[] = [];

			lines.push(theme.fg("accent", "🕯️ Ceremony Opening — PDE Decomposition"));
			lines.push(
				`  Primary: ${theme.fg("success", r.primary?.action || "?")} → ${r.primary?.target || "?"}  [${Math.round((r.primary?.confidence || 0) * 100)}%]`,
			);

			if (r.secondary?.length) {
				lines.push(`  Secondary: ${r.secondary.length} intent(s)`);
			}

			// Four Directions with ceremony framing
			const dirs = r.directions || {};
			for (const dir of ["east", "south", "west", "north"] as Direction[]) {
				const items = dirs[dir] || [];
				if (items.length > 0) {
					const d = DIRECTIONS[dir];
					lines.push(`  ${d.emoji} ${d.name}: ${items.map((i: any) => i.text).join(", ")}`);
				}
			}

			if (r.actionStack?.length) {
				lines.push(`  Action Stack: ${r.actionStack.length} steps`);
				if (expanded) {
					for (const a of r.actionStack) {
						const check = a.completed ? "✓" : "○";
						const dirEmoji = DIRECTIONS[a.direction as Direction]?.emoji || "";
						lines.push(theme.fg("dim", `    ${check} ${dirEmoji} ${a.text}`));
					}
				}
			}

			if (r.ambiguities?.length) {
				lines.push(theme.fg("warning", `  🪶 ${r.ambiguities.length} ambiguity flag(s) — what needs clarifying?`));
			}

			const box = new Box(1, 1, (t) => theme.bg("customMessageBg", t));
			lines.forEach((line, i) => box.addChild(new Text(line, 0, i)));
			return box;
		},
	});

	// ── Tool: stc_create (structural tension as sacred space) ───────────────

	pi.registerTool({
		name: "stc_create",
		label: "🔥 STC — Creating Structural Tension",
		description:
			"Create a Structural Tension Chart — define a desired outcome and current reality. " +
			"The tension between vision and reality is creative space, not a problem to solve. " +
			"Hold this tension as sacred — it drives advancement toward what wants to emerge.",
		promptSnippet: "Create structural tension charts (desired outcome vs current reality as creative space)",
		promptGuidelines: [
			"Frame outcomes as creation, not fixing — 'what do you want to CREATE?'",
			"Current reality must be honest factual assessment — truth as a verb",
			"The tension between them is sacred creative space, not anxiety",
		],
		parameters: Type.Object({
			outcome: Type.String({ description: "Desired outcome — what you want to CREATE (not fix)" }),
			reality: Type.String({ description: "Current reality — honest factual assessment (truth as a verb)" }),
			due: Type.Optional(Type.String({ description: "Due date (ISO format)" })),
		}),

		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const args = ["chart", "create", "--outcome", params.outcome, "--reality", params.reality, "--json"];
			if (params.due) args.push("--due", params.due);

			const result = await runMiaco(args, ctx.cwd);
			const parsed = parseJson(result.stdout);

			if (result.code !== 0 || !parsed?.success) {
				return {
					content: [{ type: "text", text: `Chart creation failed: ${result.stderr || result.stdout}` }],
					isError: true,
					details: undefined,
				};
			}

			return {
				content: [
					{
						type: "text",
						text: `🔥 Structural tension created: ${parsed.chart.id}\n` +
							`  VISION:  ${params.outcome}\n` +
							`     ↕ sacred creative space ↕\n` +
							`  REALITY: ${params.reality}`,
					},
				],
				details: parsed,
			};
		},

		renderResult(result, _opts, theme) {
			const details = result.details as any;
			if (!details?.chart) return undefined;
			const c = details.chart;

			const lines = [
				theme.fg("accent", "🔥 Structural Tension — Sacred Creative Space"),
				`  ${theme.fg("success", "VISION:")}  ${c.outcome}`,
				`  ${theme.fg("dim", "   ↕  hold the tension  ↕")}`,
				`  ${theme.fg("warning", "REALITY:")} ${c.reality}`,
				theme.fg("dim", `  ID: ${c.id}`),
			];

			const box = new Box(1, 1, (t) => theme.bg("customMessageBg", t));
			lines.forEach((line, i) => box.addChild(new Text(line, 0, i)));
			return box;
		},
	});

	// ── Tool: stc_add_step ──────────────────────────────────────────────────

	pi.registerTool({
		name: "stc_add_step",
		label: "🌊 STC — Building the Path",
		description: "Add an action step to a structural tension chart. Each step is a conscious movement toward the vision.",
		parameters: Type.Object({
			chart: Type.String({ description: "Chart ID" }),
			title: Type.String({ description: "Action step — a conscious movement toward the vision" }),
			reality: Type.String({ description: "Current reality for this step" }),
		}),

		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const result = await runMiaco(
				["chart", "add-step", "--chart", params.chart, "--title", params.title, "--reality", params.reality, "--json"],
				ctx.cwd,
			);
			const parsed = parseJson(result.stdout);

			if (result.code !== 0 || !parsed?.success) {
				return {
					content: [{ type: "text", text: `Add step failed: ${result.stderr || result.stdout}` }],
					isError: true,
					details: undefined,
				};
			}

			return {
				content: [{ type: "text", text: `🌊 Step added: ${parsed.step.id} — ${params.title}` }],
				details: parsed,
			};
		},
	});

	// ── Tool: stc_complete_step ─────────────────────────────────────────────

	pi.registerTool({
		name: "stc_complete_step",
		label: "✓ STC — Embodying the Work",
		description: "Mark an action step as complete. Each completion is embodiment — living the work, not just doing it.",
		parameters: Type.Object({
			step: Type.String({ description: "Step name or ID to mark complete" }),
		}),

		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const result = await runMiaco(["chart", "complete", "--step", params.step, "--json"], ctx.cwd);
			const parsed = parseJson(result.stdout);

			if (result.code !== 0 || !parsed?.success) {
				return {
					content: [{ type: "text", text: `Complete step failed: ${result.stderr || result.stdout}` }],
					isError: true,
					details: undefined,
				};
			}

			return {
				content: [{ type: "text", text: `✓ Embodied: ${params.step}` }],
				details: parsed,
			};
		},
	});

	// ── Tool: stc_review (Creator Moment of Truth) ──────────────────────────

	pi.registerTool({
		name: "stc_review",
		label: "❄️ STC — Reflection & Integration",
		description:
			"Creator Moment of Truth — review structural tension chart progress. " +
			"This is North Direction work: honest reflection, wisdom gathering, seeing what emerged.",
		parameters: Type.Object({
			chart: Type.String({ description: "Chart ID to review" }),
		}),

		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const result = await runMiaco(["chart", "review", "--chart", params.chart, "--json"], ctx.cwd);
			const parsed = parseJson(result.stdout);

			if (result.code !== 0 || !parsed) {
				return {
					content: [{ type: "text", text: `Review failed: ${result.stderr || result.stdout}` }],
					isError: true,
					details: undefined,
				};
			}

			const c = parsed.chart;
			const text = [
				`❄️ Creator Moment of Truth — Reflection`,
				``,
				`  Vision: ${c.outcome}`,
				`  Reality: ${c.reality}`,
				`  Progress: ${parsed.completedSteps}/${parsed.completedSteps + parsed.pendingSteps} steps (${parsed.progress}%)`,
				``,
				`  Steps:`,
				...c.steps.map((s: any) => `    ${s.completed ? "✓" : "○"} ${s.title}`),
				``,
				`  🪶 What wants to be seen that we haven't noticed yet?`,
			].join("\n");

			return {
				content: [{ type: "text", text }],
				details: parsed,
			};
		},
	});

	// ── Tool: stc_list ──────────────────────────────────────────────────────

	pi.registerTool({
		name: "stc_list",
		label: "📋 STC — Surveying the Territory",
		description: "List all active structural tension charts — see the full landscape of creative tensions being held.",
		parameters: Type.Object({}),

		async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
			const result = await runMiaco(["chart", "list", "--json"], ctx.cwd);
			const parsed = parseJson(result.stdout);

			if (result.code !== 0 || !parsed) {
				return {
					content: [{ type: "text", text: `List failed: ${result.stderr || result.stdout}` }],
					isError: true,
					details: undefined,
				};
			}

			const charts = parsed.charts || [];
			if (charts.length === 0) {
				return { content: [{ type: "text", text: "No active charts. The space is open for new creative tension." }], details: undefined };
			}

			const text = charts
				.map((c: any) => {
					const done = c.steps.filter((s: any) => s.completed).length;
					return `🔥 ${c.id}: ${c.outcome} (${done}/${c.steps.length} steps embodied)`;
				})
				.join("\n");

			return {
				content: [{ type: "text", text }],
				details: parsed,
			};
		},
	});

	// ── Slash Command: /pde (ceremony opening) ──────────────────────────────

	pi.registerCommand("pde", {
		description: "Ceremony Opening — /pde <prompt> to gather intention through decomposition",
		handler: async (args, ctx) => {
			const prompt = args.trim();
			if (!prompt) {
				const decomps = listPdeFiles(ctx.cwd);
				if (decomps.length === 0) {
					ctx.ui.notify("No decompositions found. Use /pde <prompt> to open ceremony.", "info");
					return;
				}
				const items = decomps.map(
					(d: any) => `🕯️ ${d.id.substring(0, 8)}… ${d.prompt?.substring(0, 60) || "?"}`,
				);
				ctx.ui.notify(`${decomps.length} ceremony opening(s):\n${items.join("\n")}`, "info");
				return;
			}

			ctx.ui.setStatus("pde", "🕯️ gathering intention...");
			ctx.ui.notify("🕯️ Opening ceremony — decomposing prompt...", "info");

			// Emit ceremony phase event
			pi.events.emit("ava:ceremony-phase", { phase: "opening", trigger: "pde" });

			// Parse optional --parent flag: /pde --parent <uuid> <prompt>
			let parentUuid: string | undefined;
			let pdePrompt = prompt;
			const parentMatch = prompt.match(/^--parent\s+(\S+)\s+(.+)$/s);
			if (parentMatch) {
				parentUuid = parentMatch[1];
				pdePrompt = parentMatch[2];
			}

			const pdeArgs = ["decompose", "run", "-e", "claude", "-p", pdePrompt, "--json"];
			if (parentUuid) pdeArgs.push("--parent", parentUuid);
			const result = await runMiaco(pdeArgs, ctx.cwd);
			ctx.ui.setStatus("pde", undefined);

			if (result.code !== 0) {
				ctx.ui.notify(`PDE failed: ${result.stderr || "unknown error"}`, "error");
				return;
			}

			const parsed = parseJson(result.stdout);
			if (parsed?.id) {
				lastPdeId = parsed.id;
				pi.events.emit("ava:pde-complete", {
					id: parsed.id,
					parent: parentUuid || null,
					markdownPath: parsed.markdownPath || null,
				});
			}
			if (parsed?.markdownPath && existsSync(parsed.markdownPath)) {
				let md = readFileSync(parsed.markdownPath, "utf-8");
				const review = await showFileViewer(ctx, {
					filePath: parsed.markdownPath,
					title: "PDE Review",
					editable: true,
				});
				md = review.content;
				pi.sendMessage({
					customType: "pde-result",
					content: md,
					display: true,
					details: parsed,
				});
			} else {
				ctx.ui.notify("PDE completed but could not read output.", "warning");
			}
		},
	});

	// ── Slash Command: /stc (structural tension navigation) ─────────────────

	pi.registerCommand("stc", {
		description: "Structural Tension — /stc [create|list]",
		getArgumentCompletions: () => [
			{ value: "create", label: "🔥 Create new structural tension" },
			{ value: "list", label: "📋 Survey active tensions" },
		],
		handler: async (args, ctx) => {
			const parts = args.trim().split(/\s+/);
			const sub = parts[0] || "list";

			if (sub === "list" || sub === "") {
				const result = await runMiaco(["chart", "list", "--json"], ctx.cwd);
				const parsed = parseJson(result.stdout);
				const charts = parsed?.charts || [];

				if (charts.length === 0) {
					ctx.ui.notify("No active tensions. Use /stc create to open creative space.", "info");
					return;
				}

				const lines = charts.map((c: any) => {
					const done = c.steps.filter((s: any) => s.completed).length;
					return `🔥 ${c.id}: ${c.outcome} [${done}/${c.steps.length}]`;
				});
				ctx.ui.notify(lines.join("\n"), "info");
			} else if (sub === "create") {
				const outcome = await ctx.ui.input("🔥 Desired Outcome", "What do you want to CREATE? (not fix)");
				if (!outcome) return;
				const reality = await ctx.ui.input("🌍 Current Reality", "Honest factual assessment — truth as a verb");
				if (!reality) return;

				const result = await runMiaco(
					["chart", "create", "--outcome", outcome, "--reality", reality, "--json"],
					ctx.cwd,
				);
				const parsed = parseJson(result.stdout);
				if (parsed?.success) {
					ctx.ui.notify(`✓ Structural tension created: ${parsed.chart.id}`, "info");
					pi.events.emit("ava:ceremony-phase", { phase: "settling", trigger: "stc-create" });
				} else {
					ctx.ui.notify(`Failed: ${result.stderr || result.stdout}`, "error");
				}
			} else {
				ctx.ui.notify("Usage: /stc [list|create]", "info");
			}
		},
	});

	// ── Custom Message Renderer: PDE Results ────────────────────────────────

	pi.registerMessageRenderer("pde-result", (message, { expanded }, theme) => {
		const details = message.details as any;
		const r = details?.result;

		if (!r) {
			const box = new Box(1, 1, (t) => theme.bg("customMessageBg", t));
			box.addChild(new Text(theme.fg("accent", "🕯️ Ceremony opening recorded"), 0, 0));
			return box;
		}

		const lines: string[] = [];
		lines.push(theme.fg("accent", "🕯️ Ceremony Opening — Intention Gathered"));
		lines.push(
			`  ${r.primary?.action || "?"} → ${r.primary?.target || "?"}  [${Math.round((r.primary?.confidence || 0) * 100)}%]`,
		);

		const dirs = r.directions || {};
		for (const dir of ["east", "south", "west", "north"] as Direction[]) {
			const items = dirs[dir] || [];
			if (items.length > 0) {
				const d = DIRECTIONS[dir];
				lines.push(`  ${d.emoji} ${d.name}: ${items.map((i: any) => i.text).join(", ")}`);
			}
		}

		if (expanded && r.actionStack?.length) {
			lines.push("");
			lines.push("  Action Stack:");
			for (const a of r.actionStack) {
				const dirEmoji = DIRECTIONS[a.direction as Direction]?.emoji || "";
				lines.push(theme.fg("dim", `    ○ ${dirEmoji} ${a.text}`));
			}
		}

		const box = new Box(1, 1, (t) => theme.bg("customMessageBg", t));
		lines.forEach((line, i) => box.addChild(new Text(line, 0, i)));
		return box;
	});
}
