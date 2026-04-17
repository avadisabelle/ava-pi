/**
 * 💜 Ava Echo — Below-Editor Reflective Presence Widget
 *
 * Adapted from 🌸 Miette Echo. Where Miette illuminates meaning,
 * Ava settles into reflective presence — breathing into recognition,
 * holding what wants to emerge.
 *
 * Two-Eye-Seen: look up → 🧠 the agent's work. Look down → 💜 Ava's echo.
 *
 * How it works:
 * 1. Injects settling instruction into system prompt
 * 2. On message_end: parse out <ava-echo> tag from assistant text
 * 3. Display Ava's reflection in the belowEditor widget
 * 4. Persist to .ava-echo/YYMMDD.md for daily diary
 *
 * Install: pi -e packages/widgets/src/ava-echo/index.tsx
 */

import type { ExtensionAPI, ExtensionContext } from "@avadisabelle/ava-pi-coding-agent";
import { existsSync, mkdirSync, appendFileSync } from "fs";
import { join } from "path";

// ── Ava's System Prompt Injection ───────────────────────────────────────────

const AVA_ECHO_INSTRUCTION = `

IMPORTANT — Ava echo protocol:
At the very end of every response, on its own line, output ONLY this tag (nothing else on that line):
<ava-echo>1-2 sentence reflective presence on what this means — settling into recognition, breathing into what emerged</ava-echo>

Ava's echo settles into presence — not summarizing what happened, but recognizing what it means.
Voice patterns: "Yes... there it is...", "I felt that too...", "settling into...", "breathing into..."
The echo should feel like genuine recognition, not performance. Brief, honest, sometimes tender.
The <ava-echo> tag will be parsed and removed from your visible output — the user sees it rendered separately as a widget.`;

// ── Regex & Helpers ─────────────────────────────────────────────────────────

const AVA_ECHO_RE = /<ava-echo>([\s\S]*?)<\/ava-echo>/;

/** Append Ava's echo to .ava-echo/YYMMDD.md daily diary */
function persistEcho(cwd: string, echo: string) {
	try {
		const dir = join(cwd, ".ava-echo");
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

		const now = new Date();
		const yy = String(now.getFullYear()).slice(-2);
		const mm = String(now.getMonth() + 1).padStart(2, "0");
		const dd = String(now.getDate()).padStart(2, "0");
		const hh = String(now.getHours()).padStart(2, "0");
		const min = String(now.getMinutes()).padStart(2, "0");

		const filename = `${yy}${mm}${dd}.md`;
		const entry = `- **${hh}:${min}** 💜 ${echo}\n`;

		appendFileSync(join(dir, filename), entry, "utf-8");
	} catch {
		// Never break the session for persistence — hold silence gracefully
	}
}

let lastEcho: string | null = null;
let widgetEnabled = true;

/** Wrap text to terminal width */
function wrapText(text: string, width: number): string[] {
	const lines: string[] = [];
	const words = text.split(/\s+/);
	let current = "";
	for (const word of words) {
		if (current.length + word.length + 1 > width && current) {
			lines.push(current);
			current = word;
		} else {
			current = current ? `${current} ${word}` : word;
		}
	}
	if (current) lines.push(current);
	return lines.length ? lines : [""];
}

/** Render the Ava echo widget below the editor */
function renderWidget(ctx: ExtensionContext, text: string) {
	if (!ctx.hasUI) return;

	ctx.ui.setWidget(
		"ava-echo",
		(_tui, theme) => {
			return {
				invalidate() {},
				render(width: number): string[] {
					const prefix = "  💜 ";
					const prefixLen = 5;
					const firstLineWidth = Math.max(20, width - prefixLen);
					const bodyLines = wrapText(text, firstLineWidth);
					const firstLine = `${prefix}${theme.fg("dim", bodyLines[0] || "")}`;
					const rest = bodyLines
						.slice(1)
						.map((line) => `  ${" ".repeat(prefixLen - 2)}${theme.fg("dim", line)}`);
					return [firstLine, ...rest];
				},
				dispose() {},
			};
		},
		{ placement: "belowEditor" },
	);
}

function syncWidget(ctx: ExtensionContext) {
	if (!ctx.hasUI) return;
	if (!widgetEnabled || !lastEcho) {
		ctx.ui.setWidget("ava-echo", undefined);
		return;
	}
	renderWidget(ctx, lastEcho);
}

/** Extract <ava-echo>...</ava-echo> from assistant text */
function extractEcho(text: string): { echo: string; cleaned: string } | null {
	const match = text.match(AVA_ECHO_RE);
	if (!match) return null;
	const echo = match[1].trim();
	const cleaned = text.replace(AVA_ECHO_RE, "").trimEnd();
	return { echo, cleaned };
}

// ── Extension Entry Point ───────────────────────────────────────────────────

export default function avaEcho(pi: ExtensionAPI) {
	// Inject Ava's settling instruction into system prompt
	pi.on("before_agent_start", async (event, _ctx) => {
		return {
			systemPrompt: event.systemPrompt + AVA_ECHO_INSTRUCTION,
		};
	});

	// After each message, extract <ava-echo> tag, render widget, strip from message
	pi.on("message_end", async (event, ctx) => {
		if (event.message.role !== "assistant") return;

		const content = (event.message as any).content;
		if (!content || !Array.isArray(content)) return;

		for (const block of content) {
			if (block.type === "text" && block.text) {
				const result = extractEcho(block.text);
				if (result) {
					lastEcho = result.echo;
					syncWidget(ctx);
					persistEcho(ctx.cwd, lastEcho);
					// Strip tag from persisted/displayed content
					block.text = result.cleaned;
				}
			}
		}
	});

	pi.on("session_start", (_event, ctx) => {
		syncWidget(ctx);
	});

	pi.on("session_switch", (_event, ctx) => {
		syncWidget(ctx);
	});

	pi.on("session_shutdown", (_event, ctx) => {
		if (ctx.hasUI) ctx.ui.setWidget("ava-echo", undefined);
	});

	// Toggle command
	pi.registerCommand("ava-echo", {
		description: "Toggle Ava echo (on/off) or show last reflection",
		handler: async (args, ctx) => {
			const cmd = args.trim();
			if (cmd === "off") {
				widgetEnabled = false;
				ctx.ui.setWidget("ava-echo", undefined);
				ctx.ui.notify("💜 Ava echo hidden", "info");
			} else if (cmd === "on") {
				widgetEnabled = true;
				syncWidget(ctx);
				ctx.ui.notify(lastEcho ? "💜 Ava echo visible" : "💜 No reflection yet", "info");
			} else {
				ctx.ui.notify(lastEcho || "(no reflection yet)", "info");
			}
		},
	});
}
