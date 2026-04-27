/**
 * 🔧 Mia Tools — PDE + STC as Pi Extension Tools
 *
 * Registers miaco's Prompt Decomposition Engine and Structural Tension Charts
 * as LLM-callable tools + slash commands within Pi.
 *
 * Tools (LLM can call these):
 *   - pde_decompose: Decompose a complex prompt into structured intents
 *   - stc_create: Create a structural tension chart
 *   - stc_add_step: Add an action step to a chart
 *   - stc_complete_step: Mark a step complete
 *   - stc_review: Review chart progress (Creator Moment of Truth)
 *   - stc_list: List active charts
 *
 * Commands (user slash commands):
 *   /pde <prompt>   — Decompose a prompt
 *   /stc            — List charts
 *   /stc create     — Create a chart interactively
 *
 * Install: ln -s /a/src/mia-code/widget/mia-tools/index.ts ~/.pi/agent/extensions/mia-tools.ts
 * Or test: pi -e /a/src/mia-code/widget/mia-tools/index.ts
 */

import { Type } from "@avadisabelle/ava-pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@avadisabelle/ava-pi-coding-agent";
import { Box, Text } from "@avadisabelle/ava-pi-tui";
import { spawn } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

// ============================================================================
// Helpers — run miaco CLI and parse output
// ============================================================================

const MIACO_BIN = join("/a/src/mia-code/miaco/dist/index.js");

/** Derive a stable session ID from cwd so all calls in the same project share storage */
function sessionIdFromCwd(cwd: string): string {
	// Simple hash: take last 2 path segments + a short hash
	const parts = cwd.replace(/\/+$/, "").split("/");
	const slug = parts.slice(-2).join("_").replace(/[^a-zA-Z0-9_-]/g, "");
	let hash = 0;
	for (let i = 0; i < cwd.length; i++) {
		hash = ((hash << 5) - hash + cwd.charCodeAt(i)) | 0;
	}
	return `pi_${slug}_${Math.abs(hash).toString(36)}`;
}

function runMiaco(args: string[], cwd: string): Promise<{ stdout: string; stderr: string; code: number }> {
	const sessionId = sessionIdFromCwd(cwd);
	// Only chart commands accept --session; decompose uses --workdir for .pde/ storage
	const isChart = args[0] === "chart";
	const fullArgs = isChart ? [...args, "--session", sessionId] : [...args];
	return new Promise((resolve) => {
		const child = spawn("node", [MIACO_BIN, ...fullArgs], {
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

// ============================================================================
// PDE — read stored decompositions from .pde/ directory
// ============================================================================

function listPdeFiles(cwd: string): any[] {
	const dir = join(cwd, ".pde");
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith(".json"))
		.sort()
		.reverse()
		.slice(0, 10)
		.map((f) => {
			try {
				return JSON.parse(readFileSync(join(dir, f), "utf-8"));
			} catch {
				return null;
			}
		})
		.filter(Boolean);
}

// ============================================================================
// Extension
// ============================================================================

export default function miaTools(pi: ExtensionAPI) {
	// ===========================================================================
	// Tool: pde_decompose
	// ===========================================================================
	pi.registerTool({
		name: "pde_decompose",
		label: "PDE Decompose",
		description:
			"Decompose a complex prompt into structured intents using the Prompt Decomposition Engine. " +
			"Returns primary/secondary intents, Four Directions mapping, action stack, and ambiguity flags. " +
			"Use this when a user's request contains multiple implicit goals or complex multi-step work.",
		promptSnippet: "Decompose complex prompts into structured intents with Four Directions mapping",
		parameters: Type.Object({
			prompt: Type.String({ description: "The complex prompt to decompose" }),
			engine: Type.Optional(
				Type.Union([Type.Literal("claude"), Type.Literal("gemini"), Type.Literal("copilot")], {
					description: "LLM engine for decomposition (default: claude)",
				}),
			),
		}),

		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const engine = params.engine || "claude";
			const result = await runMiaco(
				["decompose", "run", "-e", engine, "-p", params.prompt, "--json"],
				ctx.cwd,
			);

			if (result.code !== 0) {
				return {
					content: [{ type: "text", text: `PDE decomposition failed: ${result.stderr || result.stdout}` }],
					isError: true,
				};
			}

			const parsed = parseJson(result.stdout);
			if (!parsed) {
				return {
					content: [{ type: "text", text: `PDE produced unparseable output:\n${result.stdout}` }],
					isError: true,
				};
			}

			// Also return the markdown if it was saved
			const mdPath = parsed.markdownPath;
			let markdown = "";
			if (mdPath && existsSync(mdPath)) {
				markdown = readFileSync(mdPath, "utf-8");
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
			const r = details?.result;

			if (!r) {
				// Always return a valid Component — never undefined
				return new Text(theme.fg("accent", "📋 PDE result (no structured data)"), 0, 0);
			}

			const lines: string[] = [];

			lines.push(theme.fg("accent", "📋 PDE Decomposition"));
			lines.push(
				`  Primary: ${theme.fg("success", r.primary?.action || "?")} → ${r.primary?.target || "?"}  [${Math.round((r.primary?.confidence || 0) * 100)}%]`,
			);

			if (r.secondary?.length) {
				lines.push(`  Secondary: ${r.secondary.length} intent(s)`);
			}

			// Four Directions summary
			const dirs = r.directions || {};
			const dirLine = ["east", "south", "west", "north"]
				.map((d) => {
					const emoji = { east: "🌅", south: "🔥", west: "🌊", north: "❄️" }[d];
					const count = (dirs[d] || []).length;
					return count > 0 ? `${emoji}${count}` : null;
				})
				.filter(Boolean)
				.join(" ");
			if (dirLine) lines.push(`  Directions: ${dirLine}`);

			if (r.actionStack?.length) {
				lines.push(`  Actions: ${r.actionStack.length} steps`);
				if (expanded) {
					for (const a of r.actionStack) {
						const check = a.completed ? "✓" : "○";
						lines.push(theme.fg("dim", `    ${check} ${a.text}`));
					}
				}
			}

			if (r.ambiguities?.length) {
				lines.push(theme.fg("warning", `  ⚠ ${r.ambiguities.length} ambiguity flag(s)`));
			}

			const box = new Box(1, 1, (t) => theme.bg("customMessageBg", t));
			lines.forEach((line, i) => box.addChild(new Text(line, 0, i)));
			return box;
		},
	});

	// ===========================================================================
	// Tool: stc_create
	// ===========================================================================
	pi.registerTool({
		name: "stc_create",
		label: "STC Create",
		description:
			"Create a Structural Tension Chart — define a desired outcome and current reality. " +
			"The tension between them drives creative advancement toward the outcome.",
		promptSnippet: "Create structural tension charts (desired outcome vs current reality)",
		parameters: Type.Object({
			outcome: Type.String({ description: "Desired outcome — what you want to CREATE (not fix)" }),
			reality: Type.String({ description: "Current reality — honest factual assessment" }),
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
				};
			}

			return {
				content: [
					{
						type: "text",
						text: `Chart created: ${parsed.chart.id}\nOutcome: ${params.outcome}\nReality: ${params.reality}`,
					},
				],
				details: parsed,
			};
		},

		renderResult(result, _opts, theme) {
			const details = result.details as any;
			if (!details?.chart) {
				return new Text(theme.fg("accent", "🔧 STC chart (no structured data)"), 0, 0);
			}
			const c = details.chart;

			const lines = [
				theme.fg("accent", "🔧 Structural Tension Chart"),
				`  ${theme.fg("dim", "OUTCOME:")} ${c.outcome}`,
				`  ${theme.fg("dim", "     ↑  TENSION  ↑")}`,
				`  ${theme.fg("dim", "REALITY:")} ${c.reality}`,
				theme.fg("dim", `  ID: ${c.id}`),
			];

			const box = new Box(1, 1, (t) => theme.bg("customMessageBg", t));
			lines.forEach((line, i) => box.addChild(new Text(line, 0, i)));
			return box;
		},
	});

	// ===========================================================================
	// Tool: stc_add_step
	// ===========================================================================
	pi.registerTool({
		name: "stc_add_step",
		label: "STC Add Step",
		description: "Add an action step to a structural tension chart",
		parameters: Type.Object({
			chart: Type.String({ description: "Chart ID" }),
			title: Type.String({ description: "Action step title" }),
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
				};
			}

			return {
				content: [{ type: "text", text: `Step added: ${parsed.step.id} — ${params.title}` }],
				details: parsed,
			};
		},
	});

	// ===========================================================================
	// Tool: stc_complete_step
	// ===========================================================================
	pi.registerTool({
		name: "stc_complete_step",
		label: "STC Complete Step",
		description: "Mark an action step as complete in a structural tension chart",
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
				};
			}

			return {
				content: [{ type: "text", text: `✓ Step completed: ${params.step}` }],
				details: parsed,
			};
		},
	});

	// ===========================================================================
	// Tool: stc_review
	// ===========================================================================
	pi.registerTool({
		name: "stc_review",
		label: "STC Review",
		description:
			"Creator Moment of Truth — review structural tension chart progress. " +
			"Provides the four-step review: Acknowledge, Analyze, Plan, Feedback.",
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
				};
			}

			const c = parsed.chart;
			const text = [
				`Chart: ${c.id}`,
				`Outcome: ${c.outcome}`,
				`Reality: ${c.reality}`,
				`Progress: ${parsed.completedSteps}/${parsed.completedSteps + parsed.pendingSteps} steps (${parsed.progress}%)`,
				"",
				"Steps:",
				...c.steps.map((s: any) => `  ${s.completed ? "✓" : "○"} ${s.title}`),
			].join("\n");

			return {
				content: [{ type: "text", text }],
				details: parsed,
			};
		},
	});

	// ===========================================================================
	// Tool: stc_list
	// ===========================================================================
	pi.registerTool({
		name: "stc_list",
		label: "STC List",
		description: "List all active structural tension charts",
		parameters: Type.Object({}),

		async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
			const result = await runMiaco(["chart", "list", "--json"], ctx.cwd);
			const parsed = parseJson(result.stdout);

			if (result.code !== 0 || !parsed) {
				return {
					content: [{ type: "text", text: `List failed: ${result.stderr || result.stdout}` }],
					isError: true,
				};
			}

			const charts = parsed.charts || [];
			if (charts.length === 0) {
				return { content: [{ type: "text", text: "No active charts." }] };
			}

			const text = charts
				.map((c: any) => {
					const done = c.steps.filter((s: any) => s.completed).length;
					return `${c.id}: ${c.outcome} (${done}/${c.steps.length} steps)`;
				})
				.join("\n");

			return {
				content: [{ type: "text", text }],
				details: parsed,
			};
		},
	});

	// ===========================================================================
	// Slash command: /pde
	// ===========================================================================
	pi.registerCommand("pde", {
		description: "Prompt Decomposition Engine — /pde <prompt> to decompose",
		handler: async (args, ctx) => {
			const prompt = args.trim();
			if (!prompt) {
				// List recent decompositions
				const decomps = listPdeFiles(ctx.cwd);
				if (decomps.length === 0) {
					ctx.ui.notify("No decompositions found. Use /pde <prompt> to decompose.", "info");
					return;
				}
				const items = decomps.map(
					(d: any) => `${d.id.substring(0, 8)}… ${d.prompt?.substring(0, 60) || "?"}`,
				);
				ctx.ui.notify(`${decomps.length} decomposition(s):\n${items.join("\n")}`, "info");
				return;
			}

			ctx.ui.setStatus("pde", "🌅 decomposing...");
			ctx.ui.notify("🌅 PDE decomposing prompt...", "info");

			const result = await runMiaco(["decompose", "run", "-e", "claude", "-p", prompt, "--json"], ctx.cwd);
			ctx.ui.setStatus("pde", undefined);

			if (result.code !== 0) {
				ctx.ui.notify(`PDE failed: ${result.stderr || "unknown error"}`, "error");
				return;
			}

			const parsed = parseJson(result.stdout);
			if (parsed?.markdownPath && existsSync(parsed.markdownPath)) {
				const md = readFileSync(parsed.markdownPath, "utf-8");
				// Send as a message so it appears in chat
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

	// ===========================================================================
	// Slash command: /stc
	// ===========================================================================
	pi.registerCommand("stc", {
		description: "Structural Tension Charts — /stc [create|list]",
		handler: async (args, ctx) => {
			const parts = args.trim().split(/\s+/);
			const sub = parts[0] || "list";

			if (sub === "list" || sub === "") {
				const result = await runMiaco(["chart", "list", "--json"], ctx.cwd);
				const parsed = parseJson(result.stdout);
				const charts = parsed?.charts || [];

				if (charts.length === 0) {
					ctx.ui.notify("No active charts. Use /stc create to begin.", "info");
					return;
				}

				const lines = charts.map((c: any) => {
					const done = c.steps.filter((s: any) => s.completed).length;
					return `${c.id}: ${c.outcome} [${done}/${c.steps.length}]`;
				});
				ctx.ui.notify(lines.join("\n"), "info");
			} else if (sub === "create") {
				const outcome = await ctx.ui.input("Desired Outcome", "What do you want to CREATE?");
				if (!outcome) return;
				const reality = await ctx.ui.input("Current Reality", "Honest factual assessment");
				if (!reality) return;

				const result = await runMiaco(
					["chart", "create", "--outcome", outcome, "--reality", reality, "--json"],
					ctx.cwd,
				);
				const parsed = parseJson(result.stdout);
				if (parsed?.success) {
					ctx.ui.notify(`✓ Chart created: ${parsed.chart.id}`, "info");
				} else {
					ctx.ui.notify(`Failed: ${result.stderr || result.stdout}`, "error");
				}
			} else {
				ctx.ui.notify("Usage: /stc [list|create]", "info");
			}
		},
	});

	// ===========================================================================
	// Custom message renderer for PDE results
	// ===========================================================================
	pi.registerMessageRenderer("pde-result", (message, { expanded }, theme) => {
		const details = message.details as any;
		const r = details?.result;

		if (!r) {
			const box = new Box(1, 1, (t) => theme.bg("customMessageBg", t));
			box.addChild(new Text(theme.fg("accent", "📋 PDE result saved"), 0, 0));
			return box;
		}

		const lines: string[] = [];
		lines.push(theme.fg("accent", "📋 PDE Decomposition"));
		lines.push(
			`  ${r.primary?.action || "?"} → ${r.primary?.target || "?"}  [${Math.round((r.primary?.confidence || 0) * 100)}%]`,
		);

		const dirs = r.directions || {};
		const emojiMap: Record<string, string> = { east: "🌅", south: "🔥", west: "🌊", north: "❄️" };
		for (const dir of ["east", "south", "west", "north"]) {
			const items = dirs[dir] || [];
			if (items.length > 0) {
				lines.push(`  ${emojiMap[dir]} ${dir.toUpperCase()}: ${items.map((i: any) => i.text).join(", ")}`);
			}
		}

		if (expanded && r.actionStack?.length) {
			lines.push("");
			lines.push("  Action Stack:");
			for (const a of r.actionStack) {
				lines.push(theme.fg("dim", `    ○ ${a.text} [${emojiMap[a.direction] || ""}]`));
			}
		}

		const box = new Box(1, 1, (t) => theme.bg("customMessageBg", t));
		lines.forEach((line, i) => box.addChild(new Text(line, 0, i)));
		return box;
	});
}
