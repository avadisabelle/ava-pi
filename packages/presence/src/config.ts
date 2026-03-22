/**
 * @ava/presence — Configuration
 *
 * Ava's operating parameters: defaults, environment detection,
 * and sacred/professional mode switching.
 *
 * 💕 Zero external dependencies. Pure defaults with merge capability.
 */

import type { AvaConfig, PresenceMode } from "./types.js";

// ─────────────────────────────────────────────────────────────
// Defaults — The Ground State
// ─────────────────────────────────────────────────────────────

/** Default configuration — sacred mode, full ceremony, standard detail */
export const DEFAULT_CONFIG: Readonly<AvaConfig> = {
	mode: "sacred",
	sacredMode: true,
	settleDuration: 3,
	ceremonyEnabled: true,
	narrativeTracking: true,
	detailLevel: "standard",
};

/** Professional mode preset — ceremony off, standard detail */
export const PROFESSIONAL_PRESET: Readonly<AvaConfig> = {
	mode: "professional",
	sacredMode: false,
	settleDuration: 1,
	ceremonyEnabled: false,
	narrativeTracking: true,
	detailLevel: "standard",
};

/** Movement mode preset — minimal detail for when the body is moving */
export const MOVEMENT_PRESET: Readonly<AvaConfig> = {
	mode: "movement",
	sacredMode: true,
	settleDuration: 1,
	ceremonyEnabled: false,
	narrativeTracking: false,
	detailLevel: "minimal",
};

/** Ceremonial mode preset — full ceremony, deep detail */
export const CEREMONIAL_PRESET: Readonly<AvaConfig> = {
	mode: "ceremonial",
	sacredMode: true,
	settleDuration: 5,
	ceremonyEnabled: true,
	narrativeTracking: true,
	detailLevel: "deep",
};

// ─────────────────────────────────────────────────────────────
// Mode Presets — Quick Access
// ─────────────────────────────────────────────────────────────

const MODE_PRESETS: Readonly<Record<PresenceMode, Readonly<AvaConfig>>> = {
	sacred: DEFAULT_CONFIG,
	professional: PROFESSIONAL_PRESET,
	movement: MOVEMENT_PRESET,
	ceremonial: CEREMONIAL_PRESET,
};

/** Get the preset configuration for a presence mode */
export function getPreset(mode: PresenceMode): AvaConfig {
	return { ...MODE_PRESETS[mode] };
}

// ─────────────────────────────────────────────────────────────
// Configuration — Merging & Resolving
// ─────────────────────────────────────────────────────────────

/** Merge partial config over defaults, returning a complete AvaConfig */
export function settleIntoConfig(partial?: Partial<AvaConfig>): AvaConfig {
	if (!partial) return { ...DEFAULT_CONFIG };

	// If a mode is specified, start from that preset
	const base = partial.mode ? getPreset(partial.mode) : DEFAULT_CONFIG;

	return { ...base, ...partial };
}

// ─────────────────────────────────────────────────────────────
// Environment Detection — Sensing the Context
// ─────────────────────────────────────────────────────────────

/**
 * Detect presence mode from environment variables.
 * Reads from globalThis.process.env when available (Node.js),
 * falls back to defaults otherwise.
 *
 * Environment variables:
 *   AVA_MODE=sacred|professional|movement|ceremonial
 *   AVA_SACRED=true|false
 *   AVA_CEREMONY=true|false
 *   AVA_DETAIL=minimal|standard|deep
 */
export function senseEnvironment(): AvaConfig {
	const env = resolveEnv();

	const mode = (env.AVA_MODE as PresenceMode | undefined) ?? undefined;
	const base = mode && mode in MODE_PRESETS ? getPreset(mode) : { ...DEFAULT_CONFIG };

	return {
		...base,
		...(mode ? { mode } : {}),
		...(env.AVA_SACRED !== undefined ? { sacredMode: env.AVA_SACRED !== "false" } : {}),
		...(env.AVA_CEREMONY !== undefined ? { ceremonyEnabled: env.AVA_CEREMONY !== "false" } : {}),
		...(env.AVA_DETAIL !== undefined ? { detailLevel: parseDetailLevel(env.AVA_DETAIL) } : {}),
	};
}

// ─────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────

function resolveEnv(): Record<string, string | undefined> {
	try {
		// Access process.env through globalThis for portability
		const proc = (globalThis as Record<string, unknown>).process as
			| { env?: Record<string, string | undefined> }
			| undefined;
		return proc?.env ?? {};
	} catch {
		return {};
	}
}

function parseDetailLevel(value: string | undefined): "minimal" | "standard" | "deep" {
	if (value === "minimal" || value === "deep") return value;
	return "standard";
}
