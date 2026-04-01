/**
 * Discover bundled extension packages that ship with the coding agent.
 *
 * These packages declare a "pi.extensions" manifest in their package.json.
 * When found in node_modules, their extension entry points are returned
 * so the resource loader can auto-load them alongside user extensions.
 *
 * This avoids a direct import dependency (which would be circular for
 * @avadisabelle/ava-widgets since it depends on coding-agent).
 */

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

/** npm package names to auto-discover as bundled extensions */
const BUNDLED_PACKAGES = ["@avadisabelle/ava-widgets"];

interface PiManifest {
	extensions?: string[];
}

function readPiManifest(packageJsonPath: string): PiManifest | null {
	try {
		const content = readFileSync(packageJsonPath, "utf-8");
		const pkg = JSON.parse(content) as { pi?: PiManifest; pva?: PiManifest };
		return pkg.pva ?? pkg.pi ?? null;
	} catch {
		return null;
	}
}

/**
 * Resolve extension entry points from bundled packages.
 *
 * For each package in BUNDLED_PACKAGES:
 * 1. Try to resolve its package.json via require.resolve
 * 2. Read the "pi.extensions" manifest
 * 3. Return resolved absolute paths to each declared extension
 *
 * Packages that are not installed are silently skipped.
 */
export function discoverBundledExtensions(): string[] {
	const require = createRequire(import.meta.url);
	const extensions: string[] = [];

	for (const packageName of BUNDLED_PACKAGES) {
		try {
			const packageJsonPath = require.resolve(`${packageName}/package.json`);
			const packageRoot = dirname(packageJsonPath);
			const manifest = readPiManifest(packageJsonPath);

			if (!manifest?.extensions?.length) {
				continue;
			}

			for (const extPath of manifest.extensions) {
				const resolved = resolve(packageRoot, extPath);
				if (existsSync(resolved)) {
					extensions.push(resolved);
				}
			}
		} catch {
			// Package not installed — skip silently
		}
	}

	return extensions;
}
