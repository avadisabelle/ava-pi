import type { ExtensionContext } from "@avadisabelle/ava-pi-coding-agent";
import { execSync, spawn } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "http";
import { basename, extname, resolve } from "path";
import { generateFileViewerHTML } from "./file-viewer-html.js";
import {
	type ActiveViewerSession,
	clearActiveViewer,
	closeActiveViewer,
	getActiveViewer,
	notifyViewerOpen,
	registerActiveViewer,
} from "./viewer-session.js";

export interface FileViewerResult {
	action: "done";
	modified: boolean;
	content: string;
}

export interface ShowFileViewerParams {
	filePath: string;
	title?: string;
	lineRange?: string;
	editable?: boolean;
}

let activeServer: Server | null = null;
let activeSession: ActiveViewerSession | null = null;

function openBrowser(url: string): void {
	try {
		execSync(`open "${url}"`, { stdio: "ignore" });
	} catch {
		try {
			execSync(`xdg-open "${url}"`, { stdio: "ignore" });
		} catch {
			try {
				execSync(`start "${url}"`, { stdio: "ignore" });
			} catch {}
		}
	}
}

function parseRange(content: string, lineRange?: string): string {
	if (!lineRange) return content;
	const lines = content.split("\n");
	const match = lineRange.match(/^(\d+)(?:-(\d+))?$/);
	if (!match) return content;
	const start = Math.max(0, Number.parseInt(match[1], 10) - 1);
	const end = match[2] ? Math.min(lines.length, Number.parseInt(match[2], 10)) : start + 1;
	const out: string[] = [];
	if (start > 0) out.push("...");
	out.push(...lines.slice(start, end));
	if (end < lines.length) out.push("...");
	return out.join("\n");
}

function launchEditor(editor: string, filePath: string): { ok: boolean; error?: string } {
	const macAppMap: Record<string, string> = {
		cursor: "Cursor",
		windsurf: "Windsurf",
		vscode: "Visual Studio Code",
	};
	const commandMap: Record<string, string[]> = {
		cursor: ["cursor", filePath],
		windsurf: ["windsurf", filePath],
		vscode: ["code", filePath],
	};
	if (!commandMap[editor]) return { ok: false, error: `Unsupported editor: ${editor}` };
	try {
		if (process.platform === "darwin") {
			const appName = macAppMap[editor];
			const child = spawn("open", ["-a", appName, filePath], { detached: true, stdio: "ignore" });
			child.unref();
			return { ok: true };
		}
		const cmd = commandMap[editor];
		const child = spawn(cmd[0], cmd.slice(1), { detached: true, stdio: "ignore" });
		child.unref();
		return { ok: true };
	} catch (err: any) {
		return { ok: false, error: err?.message || `Failed to launch ${editor}` };
	}
}

function detectLanguage(filePath: string): string {
	const name = basename(filePath).toLowerCase();
	if (name === "dockerfile") return "dockerfile";
	if (name === "makefile" || name === "gnumakefile") return "makefile";
	if (name === ".gitignore" || name === ".gitconfig") return "ini";
	if (name === "cargo.toml") return "toml";
	if (name === ".env" || name.startsWith(".env.")) return "ini";
	const ext = extname(filePath).replace(/^\./, "").toLowerCase();
	const map: Record<string, string> = {
		js: "javascript",
		jsx: "javascript",
		mjs: "javascript",
		cjs: "javascript",
		ts: "typescript",
		tsx: "typescript",
		mts: "typescript",
		cts: "typescript",
		py: "python",
		rb: "ruby",
		rs: "rust",
		go: "go",
		java: "java",
		kt: "kotlin",
		kts: "kotlin",
		swift: "swift",
		c: "c",
		h: "c",
		cpp: "cpp",
		cc: "cpp",
		cs: "csharp",
		html: "html",
		htm: "html",
		css: "css",
		scss: "scss",
		json: "json",
		jsonc: "json",
		md: "markdown",
		mdx: "markdown",
		yaml: "yaml",
		yml: "yaml",
		xml: "xml",
		svg: "xml",
		plist: "xml",
		sql: "sql",
		sh: "bash",
		bash: "bash",
		zsh: "bash",
		fish: "bash",
		toml: "toml",
		ini: "ini",
		conf: "ini",
		cfg: "ini",
		properties: "ini",
		php: "php",
		lua: "lua",
		r: "r",
		graphql: "graphql",
		gql: "graphql",
		proto: "protobuf",
		tf: "hcl",
		hcl: "hcl",
	};
	return map[ext] || "";
}

function startFileViewerServer(opts: {
	filePath: string;
	title: string;
	editable: boolean;
	lineRange?: string;
	language?: string;
}): Promise<{ port: number; server: Server; waitForResult: () => Promise<FileViewerResult> }> {
	return new Promise((resolveSetup, rejectSetup) => {
		let initialContent = "";
		try {
			initialContent = readFileSync(opts.filePath, "utf-8");
		} catch (err) {
			rejectSetup(err);
			return;
		}
		const originalContent = initialContent;

		let resolveResult!: (result: FileViewerResult) => void;
		const resultPromise = new Promise<FileViewerResult>((res) => {
			resolveResult = res;
		});

		const server = createServer((req: IncomingMessage, res: ServerResponse) => {
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
			res.setHeader("Access-Control-Allow-Headers", "Content-Type");

			if (req.method === "OPTIONS") {
				res.writeHead(204);
				res.end();
				return;
			}

			const url = new URL(req.url || "/", "http://localhost");

			if (url.pathname === "/favicon.ico") {
				res.writeHead(204);
				res.end();
				return;
			}

			if (req.method === "GET" && url.pathname === "/") {
				const port = (server.address() as any)?.port || 0;
				res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
				res.setHeader("Pragma", "no-cache");
				res.setHeader("Expires", "0");
				const html = generateFileViewerHTML({
					title: opts.title,
					filePath: opts.filePath,
					content: parseRange(initialContent, opts.lineRange),
					port,
					lineRange: opts.lineRange,
					editable: opts.editable,
					language: opts.language,
				});
				res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
				res.end(html);
				return;
			}

			if (req.method === "POST" && url.pathname === "/open-editor") {
				let body = "";
				req.on("data", (chunk) => {
					body += chunk;
				});
				req.on("end", () => {
					try {
						const data = JSON.parse(body || "{}");
						const result = launchEditor(String(data.editor || ""), opts.filePath);
						res.writeHead(result.ok ? 200 : 400, { "Content-Type": "application/json" });
						res.end(JSON.stringify(result));
					} catch (err: any) {
						res.writeHead(400, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ ok: false, error: err?.message || "Editor launch failed" }));
					}
				});
				return;
			}

			if (req.method === "POST" && url.pathname === "/save") {
				let body = "";
				req.on("data", (chunk) => {
					body += chunk;
				});
				req.on("end", () => {
					try {
						if (!opts.editable) throw new Error("This viewer is read-only");
						const data = JSON.parse(body || "{}");
						writeFileSync(opts.filePath, data.content || "", "utf-8");
						initialContent = data.content || "";
						res.writeHead(200, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ ok: true }));
					} catch (err: any) {
						res.writeHead(400, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ ok: false, error: err?.message || "Save failed" }));
					}
				});
				return;
			}

			if (req.method === "POST" && url.pathname === "/result") {
				let body = "";
				req.on("data", (chunk) => {
					body += chunk;
				});
				req.on("end", () => {
					try {
						const data = JSON.parse(body || "{}");
						let diskContent = initialContent;
						try {
							diskContent = readFileSync(opts.filePath, "utf-8");
						} catch {}
						const finalContent =
							typeof diskContent === "string"
								? diskContent
								: typeof data.content === "string"
									? data.content
									: initialContent;
						const modified = !!data.modified || finalContent !== originalContent;
						res.writeHead(200, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ ok: true, modified }));
						resolveResult({
							action: "done",
							modified,
							content: finalContent,
						});
					} catch {
						res.writeHead(400, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
					}
				});
				return;
			}

			res.writeHead(404);
			res.end("Not found");
		});

		server.listen(0, "127.0.0.1", () => {
			const addr = server.address() as any;
			resolveSetup({ port: addr.port, server, waitForResult: () => resultPromise });
		});
	});
}

function cleanupServer(): void {
	const server = activeServer;
	activeServer = null;
	if (server) {
		try {
			server.close();
		} catch {}
	}
	if (activeSession) {
		clearActiveViewer(activeSession);
		activeSession = null;
	}
}

export async function showFileViewer(ctx: ExtensionContext, params: ShowFileViewerParams): Promise<FileViewerResult> {
	cleanupServer();

	const filePath = resolve(params.filePath);
	if (!existsSync(filePath)) {
		throw new Error(`File not found: ${filePath}`);
	}

	const editable = params.editable === true;
	const title = params.title || basename(filePath);
	const language = detectLanguage(filePath);
	const { port, server, waitForResult } = await startFileViewerServer({
		filePath,
		title,
		editable,
		lineRange: params.lineRange,
		language,
	});

	activeServer = server;
	const url = `http://127.0.0.1:${port}`;
	activeSession = {
		kind: "file",
		title: "File viewer",
		url,
		server,
		onClose: () => {
			activeServer = null;
			activeSession = null;
		},
	};
	registerActiveViewer(activeSession);
	openBrowser(url);
	notifyViewerOpen(ctx, activeSession);

	try {
		return await waitForResult();
	} finally {
		cleanupServer();
	}
}

export function closeFileViewer() {
	return closeActiveViewer();
}

export function getActiveFileViewer() {
	return getActiveViewer();
}

export function cleanupFileViewer() {
	cleanupServer();
}
