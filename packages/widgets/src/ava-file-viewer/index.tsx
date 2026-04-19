import { Type } from "@avadisabelle/ava-pi-ai";
import type { ExtensionAPI } from "@avadisabelle/ava-pi-coding-agent";
import { basename } from "path";
import { cleanupFileViewer, closeFileViewer, getActiveFileViewer, showFileViewer } from "../lib/file-viewer.js";

const ShowFileParams = Type.Object({
	file_path: Type.String({ description: "Path to the file to open" }),
	title: Type.Optional(Type.String({ description: "Optional title shown in the viewer header" })),
	line_range: Type.Optional(Type.String({ description: "Optional line range like '45-60' or '45'" })),
	editable: Type.Optional(Type.Boolean({ description: "Whether to allow editing and saving from the browser UI" })),
});

export default function avaFileViewer(pi: ExtensionAPI) {
	pi.registerTool({
		name: "show_file",
		label: "Show File",
		description:
			"Open a lightweight local file viewer/editor in the browser without Commander. " +
			"Supports read-only viewing by default, optional editing/saving, and simple line-range display.",
		parameters: ShowFileParams,
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const result = await showFileViewer(ctx, {
				filePath: params.file_path,
				title: params.title,
				lineRange: params.line_range,
				editable: params.editable,
			});

			return {
				content: [{
					type: "text",
					text: result.modified
						? `User pressed Done in the file viewer after making changes. The latest file content is on disk at ${params.file_path}.`
						: `User pressed Done in the file viewer without changing ${params.file_path}.`,
				}],
				details: result,
			};
		},
	});

	pi.registerCommand("show-file", {
		description: "Open a local file viewer/editor in the browser",
		handler: async (args, ctx) => {
			const filePath = String(args || "").trim();
			if (!filePath) {
				ctx.ui.notify("Usage: /show-file <path>", "warning");
				return;
			}

			await showFileViewer(ctx, {
				filePath,
				title: basename(filePath),
				editable: false,
			});
		},
	});

	pi.registerTool({
		name: "close_viewer",
		label: "Close Viewer",
		description: "Close the currently active local browser viewer from the CLI if one is open.",
		parameters: Type.Object({}),
		async execute() {
			const closed = closeFileViewer();
			if (!closed.closed) {
				return {
					content: [{ type: "text" as const, text: "No active local viewer is open." }],
					details: closed,
				};
			}
			return {
				content: [{ type: "text" as const, text: `Closed ${closed.kind} viewer${closed.title ? `: ${closed.title}` : ""}.` }],
				details: closed,
			};
		},
	});

	pi.registerCommand("close-viewer", {
		description: "Close the currently active local browser viewer from the CLI",
		handler: async (_args, ctx) => {
			const viewer = getActiveFileViewer();
			if (!viewer) {
				ctx.ui.notify("No active local viewer is open", "info");
				return;
			}
			closeFileViewer();
			ctx.ui.notify(`Closed ${viewer.kind} viewer`, "info");
		},
	});

	pi.on("session_shutdown", (_event, _ctx) => {
		cleanupFileViewer();
	});
}
