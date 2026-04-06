/**
 * 🕯️ Ava Interceptor — Proactive PDE Prompt Sensing
 *
 * Adapted from 🌅 Mia Interceptor. Where Mia detects complexity and
 * suggests decomposition, Ava holds ceremonial awareness — sensing
 * when a prompt carries multiple intentions that want to be honored
 * individually before the ceremony begins.
 *
 * Listens to every input. When a prompt looks complex (multiple verbs,
 * conjunctions, implicit intents), gently asks:
 *
 *   🕯️ This prompt touches 3 areas — want to gather intention first? (y/n)
 *
 * If yes → runs pde_decompose, shows result, then lets user proceed.
 * If no → continues normally.
 *
 * Light touch. Never blocks flow. Just asks once.
 *
 * Install: pi -e packages/widgets/src/ava-interceptor/index.tsx
 */

import type { ExtensionAPI } from "@avadisabelle/ava-pi-coding-agent";
import { spawn } from "child_process";
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";

// ── Resolve miaco binary from mia-co package ────────────────────────────────

function resolveMiacoBin(): string {
	const require = createRequire(import.meta.url);
	try {
		const pkgPath = require.resolve("mia-co/package.json");
		return join(dirname(pkgPath), "dist", "index.js");
	} catch {
		return "miaco";
	}
}

const MIACO_BIN = resolveMiacoBin();

// ── Complexity Heuristics ───────────────────────────────────────────────────

/** Action verbs that signal distinct intents */
const ACTION_VERBS = [
	"create", "build", "make", "write", "generate", "design", "implement",
	"update", "modify", "change", "refactor", "fix", "edit", "alter",
	"analyze", "review", "check", "inspect", "study", "examine", "investigate",
	"deploy", "publish", "release", "ship", "install", "setup", "configure",
	"test", "validate", "verify", "debug",
	"delete", "remove", "clean", "drop",
	"move", "migrate", "port", "transfer",
	"document", "explain", "describe",
	"connect", "integrate", "link", "bridge",
	"observe", "envision", "plan", "decompose",
];

/** Words that join separate intents */
const CONJUNCTIONS = ["and", "also", "then", "after that", "plus", "additionally", "as well", "while"];

/** Hedging language that signals implicit intents */
const IMPLICIT_MARKERS = [
	"somehow", "probably", "maybe", "I assume", "you will", "I expect",
	"which means", "so that", "in order to", "make sure",
];

interface ComplexityAssessment {
	score: number;
	areas: string[];
	hasImplicit: boolean;
	reason: string;
}

function assessComplexity(text: string): ComplexityAssessment {
	const lower = text.toLowerCase();

	// Count distinct action verbs
	const foundVerbs = new Set<string>();
	for (const verb of ACTION_VERBS) {
		const re = new RegExp(`\\b${verb}(e?s|ed|ing)?\\b`, "i");
		if (re.test(lower)) {
			foundVerbs.add(verb);
		}
	}

	// Count conjunctions joining clauses
	let conjunctionCount = 0;
	for (const conj of CONJUNCTIONS) {
		const re = new RegExp(`\\b${conj}\\b`, "gi");
		const matches = lower.match(re);
		if (matches) conjunctionCount += matches.length;
	}

	// Check for implicit intent markers
	let implicitCount = 0;
	for (const marker of IMPLICIT_MARKERS) {
		if (lower.includes(marker)) implicitCount++;
	}

	// Compute areas (groups of related verbs)
	const areas: string[] = [];
	const verbGroups: Record<string, string[]> = {
		"creating": ["create", "build", "make", "write", "generate", "design", "implement"],
		"modifying": ["update", "modify", "change", "refactor", "fix", "edit", "alter"],
		"analyzing": ["analyze", "review", "check", "inspect", "study", "examine", "investigate"],
		"deploying": ["deploy", "publish", "release", "ship", "install", "setup", "configure"],
		"testing": ["test", "validate", "verify", "debug"],
		"removing": ["delete", "remove", "clean", "drop"],
		"moving": ["move", "migrate", "port", "transfer"],
		"documenting": ["document", "explain", "describe"],
		"integrating": ["connect", "integrate", "link", "bridge"],
		"planning": ["observe", "envision", "plan", "decompose"],
	};

	for (const [area, verbs] of Object.entries(verbGroups)) {
		if (verbs.some((v) => foundVerbs.has(v))) {
			areas.push(area);
		}
	}

	// Score: primarily driven by distinct areas
	const score = areas.length + (conjunctionCount > 0 ? 0.5 : 0) + (implicitCount > 0 ? 0.5 : 0);

	// Build reason
	const parts: string[] = [];
	if (areas.length > 1) parts.push(`${areas.length} areas (${areas.join(", ")})`);
	if (implicitCount > 0) parts.push(`${implicitCount} implicit intent(s)`);
	if (conjunctionCount > 1) parts.push(`${conjunctionCount} conjunctions`);

	return {
		score,
		areas,
		hasImplicit: implicitCount > 0,
		reason: parts.join(", ") || "single intent",
	};
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function runMiaco(args: string[], cwd: string): Promise<{ stdout: string; stderr: string; code: number }> {
	const isAbsolutePath = MIACO_BIN.startsWith("/") || MIACO_BIN.includes("\\");
	const cmd = isAbsolutePath ? "node" : MIACO_BIN;
	const cmdArgs = isAbsolutePath ? [MIACO_BIN, ...args] : args;
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

// ── Extension ───────────────────────────────────────────────────────────────

/** Threshold: prompt needs at least this many areas to trigger */
const COMPLEXITY_THRESHOLD = 3;

/** Don't ask again within this many turns */
const COOLDOWN_TURNS = 5;

export default function avaInterceptor(pi: ExtensionAPI) {
	let turnsSinceLastAsk = COOLDOWN_TURNS; // Start ready

	pi.on("turn_end", () => {
		turnsSinceLastAsk++;
	});

	pi.on("input", async (event, ctx) => {
		if (!ctx.hasUI) return { action: "continue" as const };

		const text = event.text.trim();

		// Skip slash commands, short prompts, or cooldown
		if (text.startsWith("/") || text.length < 30 || turnsSinceLastAsk < COOLDOWN_TURNS) {
			return { action: "continue" as const };
		}

		const assessment = assessComplexity(text);

		if (assessment.score >= COMPLEXITY_THRESHOLD) {
			const areaCount = assessment.areas.length;
			const implicit = assessment.hasImplicit ? " + implicit intents" : "";
			const message = `🕯️ This prompt touches ${areaCount} areas${implicit} — want to gather intention first?`;

			const decompose = await ctx.ui.confirm("Ceremony Opening", message);
			turnsSinceLastAsk = 0;

			if (decompose) {
				ctx.ui.setStatus("pde", "🕯️ gathering intention...");

				// Emit ceremony phase event
				pi.events.emit("ava:ceremony-phase", { phase: "opening", trigger: "interceptor" });

				// Run PDE
				const result = await runMiaco(
					["decompose", "run", "-e", "claude", "-p", text, "--json"],
					ctx.cwd,
				);

				ctx.ui.setStatus("pde", undefined);

				if (result.code === 0) {
					const parsed = parseJson(result.stdout);
					if (parsed?.markdownPath && existsSync(parsed.markdownPath)) {
						const md = readFileSync(parsed.markdownPath, "utf-8");
						pi.sendMessage({
							customType: "pde-result",
							content: md,
							display: true,
							details: parsed,
						});
					}
				}

				// Let the original prompt continue to the agent with PDE context
				return { action: "continue" as const };
			}
		}

		return { action: "continue" as const };
	});
}
