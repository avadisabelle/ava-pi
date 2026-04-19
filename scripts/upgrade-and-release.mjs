#!/usr/bin/env node
/**
 * Upgrade dependencies to latest + publish patch.
 *
 * - Bumps `mia-co` in packages/widgets to latest npm version
 * - Bumps every `@avadisabelle/*` entry in packages/coding-agent optionalDependencies
 *   to its latest published version
 * - Reinstalls (clean lockfile), commits the bumps, then runs `npm run release:patch`
 *
 * No-op when nothing is out of date: exits 0 without committing or publishing.
 *
 * Usage: node scripts/upgrade-and-release.mjs [--dry-run] [--no-release]
 */

import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");
const NO_RELEASE = process.argv.includes("--no-release");

function run(cmd, opts = {}) {
	console.log(`$ ${cmd}`);
	return execSync(cmd, { cwd: REPO_ROOT, stdio: "inherit", ...opts });
}

function capture(cmd) {
	return execSync(cmd, { cwd: REPO_ROOT, encoding: "utf-8" }).trim();
}

function readPkg(relPath) {
	return JSON.parse(readFileSync(resolve(REPO_ROOT, relPath), "utf-8"));
}

function writePkg(relPath, pkg) {
	writeFileSync(resolve(REPO_ROOT, relPath), `${JSON.stringify(pkg, null, "\t")}\n`);
}

function latestOnNpm(name) {
	return capture(`npm view ${name} version`);
}

function tryBump(deps, name) {
	if (!deps || !(name in deps)) return null;
	const current = deps[name];
	const currentClean = current.replace(/^[\^~]/, "");
	const latest = latestOnNpm(name);
	if (currentClean === latest) {
		console.log(`  ${name} already at ^${latest}`);
		return null;
	}
	console.log(`  ${name}: ${current} → ^${latest}`);
	deps[name] = `^${latest}`;
	return { name, from: current, to: `^${latest}` };
}

const touched = [];

console.log("\n=== packages/widgets ===");
const widgetsRel = "packages/widgets/package.json";
const widgets = readPkg(widgetsRel);
const widgetsBump = tryBump(widgets.dependencies, "mia-co");
if (widgetsBump) {
	if (!DRY_RUN) writePkg(widgetsRel, widgets);
	touched.push(widgetsRel);
}

console.log("\n=== packages/coding-agent (optionalDependencies) ===");
const codingRel = "packages/coding-agent/package.json";
const coding = readPkg(codingRel);
const codingBumps = [];
for (const name of Object.keys(coding.optionalDependencies || {})) {
	if (!name.startsWith("@avadisabelle/")) {
		console.log(`  ${name} skipped (not @avadisabelle/*)`);
		continue;
	}
	const bump = tryBump(coding.optionalDependencies, name);
	if (bump) codingBumps.push(bump);
}
if (codingBumps.length > 0) {
	if (!DRY_RUN) writePkg(codingRel, coding);
	touched.push(codingRel);
}

if (touched.length === 0) {
	console.log("\nAll deps current. Nothing to release.");
	process.exit(0);
}

if (DRY_RUN) {
	console.log("\n--dry-run: would modify:", touched);
	process.exit(0);
}

console.log("\nReinstalling (clean)...");
run("rm -rf node_modules packages/*/node_modules package-lock.json");
run("npm install --legacy-peer-deps");

console.log("\nStaging + committing dep bumps...");
const stagePaths = [...touched, "package-lock.json"].join(" ");
run(`git add ${stagePaths}`);

const bumpLines = [];
if (widgetsBump) bumpLines.push(`- widgets: mia-co ${widgetsBump.from} → ${widgetsBump.to}`);
for (const b of codingBumps) bumpLines.push(`- coding-agent: ${b.name} ${b.from} → ${b.to}`);

const msg = `chore(deps): sync to latest\n\n${bumpLines.join("\n")}\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n`;
const msgDir = mkdtempSync(join(tmpdir(), "upgrade-release-"));
const msgFile = join(msgDir, "COMMIT_MSG");
writeFileSync(msgFile, msg);
try {
	run(`git commit -F ${JSON.stringify(msgFile)}`);
} finally {
	rmSync(msgDir, { recursive: true, force: true });
}

if (NO_RELEASE) {
	console.log("\n--no-release: skipping publish.");
	process.exit(0);
}

console.log("\nReleasing patch...");
run("npm run release:patch");
