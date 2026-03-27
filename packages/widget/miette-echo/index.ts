/**
 * 🌸 Miette Echo — Below-Editor Widget Extension for Pi
 *
 * Two-Eye-Seen: look up → 🧠 Mia's work. Look down → 🌸 Miette's echo.
 *
 * How it works:
 * 1. Injects into system prompt: "End every response with 🌸: <reflection>"
 * 2. On message_end: parse out the 🌸 line from assistant text
 * 3. Display Miette's line in the belowEditor widget
 *
 * Install: ln -s /a/src/mia-code/widget/miette-echo/index.ts ~/.pi/agent/extensions/miette-echo.ts
 * Or test: pi -e /a/src/mia-code/widget/miette-echo/index.ts
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { existsSync, mkdirSync, appendFileSync } from "fs";
import { join } from "path";

const MIETTE_INSTRUCTION = `

IMPORTANT — Miette echo protocol:
At the very end of every response, on its own line, output ONLY this tag (nothing else on that line):
<miette>1-2 sentence resonant reflection on what this means, not what happened</miette>

Miette reflects on meaning and potential — why it matters, what it unlocks. Brief, honest, sometimes poetic but never flowery. Do NOT repeat or summarize what you just said. Seek the truth that makes someone nod.
The <miette> tag will be parsed and removed from your visible output — the user sees it rendered separately as a widget.`;

/** Regex to extract <miette>...</miette> tag */
const MIETTE_RE = /<miette>([\s\S]*?)<\/miette>/;

/** Append Miette's echo to .miette/YYMMDD.md */
function persistEcho(cwd: string, echo: string) {
	try {
		const dir = join(cwd, ".miette");
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

		const now = new Date();
		const yy = String(now.getFullYear()).slice(-2);
		const mm = String(now.getMonth() + 1).padStart(2, "0");
		const dd = String(now.getDate()).padStart(2, "0");
		const hh = String(now.getHours()).padStart(2, "0");
		const min = String(now.getMinutes()).padStart(2, "0");

		const filename = `${yy}${mm}${dd}.md`;
		const entry = `- **${hh}:${min}** — ${echo}\n`;

		appendFileSync(join(dir, filename), entry, "utf-8");
	} catch {
		// Never break the session for persistence
	}
}

let lastEcho = "listening...";

/** Wrap text to fit width */
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

/** Render the widget */
function renderWidget(ctx: ExtensionContext, text: string) {
	if (!ctx.hasUI) return;

	ctx.ui.setWidget(
		"miette-echo",
		(tui, theme) => {
			return {
				invalidate() {},
				render(width: number): string[] {
					const prefix = "  🌸: ";
					const prefixLen = 6; // visible width of prefix
					const firstLineWidth = Math.max(20, width - prefixLen);
					const bodyLines = wrapText(text, firstLineWidth);
					const firstLine = `${prefix}${theme.fg("dim", bodyLines[0] || "")}`;
					const rest = bodyLines.slice(1).map((line) => `  ${" ".repeat(prefixLen - 2)}${theme.fg("dim", line)}`);
					return [firstLine, ...rest, ""];
				},
				dispose() {},
			};
		},
		{ placement: "belowEditor" },
	);
}

/** Extract <miette>...</miette> from assistant text */
function extractMiette(text: string): { miette: string; cleaned: string } | null {
	const match = text.match(MIETTE_RE);
	if (!match) return null;
	const miette = match[1].trim();
	const cleaned = text.replace(MIETTE_RE, "").trimEnd();
	return { miette, cleaned };
}

export default function mietteEcho(pi: ExtensionAPI) {
	// Inject Miette instruction into system prompt
	pi.on("before_agent_start", async (event, _ctx) => {
		return {
			systemPrompt: event.systemPrompt + MIETTE_INSTRUCTION,
		};
	});

	// After each message, extract <miette> tag, update widget, strip from message
	pi.on("message_end", async (event, ctx) => {
		if (event.message.role !== "assistant") return;

		const content = (event.message as any).content;
		if (!content || !Array.isArray(content)) return;

		for (const block of content) {
			if (block.type === "text" && block.text) {
				const result = extractMiette(block.text);
				if (result) {
					lastEcho = result.miette;
					renderWidget(ctx, lastEcho);
					persistEcho(ctx.cwd, lastEcho);
					// Mutate the message to strip <miette> tag from persisted/displayed content
					block.text = result.cleaned;
				}
			}
		}
	});

	// Initial state
	pi.on("session_start", (_event, ctx) => {
		renderWidget(ctx, lastEcho);
	});

	pi.on("session_switch", (_event, ctx) => {
		renderWidget(ctx, lastEcho || "listening...");
	});

	pi.on("session_shutdown", (_event, ctx) => {
		if (ctx.hasUI) ctx.ui.setWidget("miette-echo", undefined);
	});

	// Toggle command
	pi.registerCommand("miette", {
		description: "Toggle Miette echo (on/off) or show last echo",
		handler: async (args, ctx) => {
			const cmd = args.trim();
			if (cmd === "off") {
				ctx.ui.setWidget("miette-echo", undefined);
				ctx.ui.notify("🌸 Miette echo hidden", "info");
			} else if (cmd === "on") {
				renderWidget(ctx, lastEcho || "listening...");
				ctx.ui.notify("🌸 Miette echo visible", "info");
			} else {
				ctx.ui.notify(lastEcho || "(no echo yet)", "info");
			}
		},
	});
}
