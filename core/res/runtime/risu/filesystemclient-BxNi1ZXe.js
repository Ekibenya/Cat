import { t as e } from "./internalmcp-BEm-hL3W.js";
//#region src/ts/process/mcp/filesystemclient.ts
var t = class extends e {
	directoryHandle = null;
	initialized = !1;
	constructor() {
		super("internal:fs"), this.serverInfo.serverInfo.name = "File System Access MCP", this.serverInfo.serverInfo.version = "1.0.0", this.serverInfo.instructions = "FProvides file system access using the File System Access API";
	}
	async checkHandshake() {
		return this.initialized ||= (await this.initializeDirectory(), !0), this.serverInfo;
	}
	async initializeDirectory() {
		if (!("showDirectoryPicker" in window)) throw Error("File System Access API is not supported in this browser. Please use a compatible browser like Chrome or Edge.");
		try {
			if (this.directoryHandle = await window.showDirectoryPicker(), !this.directoryHandle) throw Error("Directory selection was cancelled or failed.");
			console.log(`FileSystemClient: Selected directory: ${this.directoryHandle.name}`);
		} catch {
			throw Error("Directory selection cancelled or failed. Please try again.");
		}
	}
	async getToolList() {
		return [
			{
				name: "fs_read_file",
				description: "Read contents of a file (supports text files, pdf, images)",
				inputSchema: {
					type: "object",
					properties: { path: {
						type: "string",
						description: "Path to the file relative to selected directory"
					} },
					required: ["path"]
				}
			},
			{
				name: "fs_write_file",
				description: "Write contents to a file",
				inputSchema: {
					type: "object",
					properties: {
						path: {
							type: "string",
							description: "Path to the file relative to selected directory"
						},
						content: {
							type: "string",
							description: "Content to write to the file"
						}
					},
					required: ["path", "content"]
				}
			},
			{
				name: "fs_list_directory",
				description: "List contents of a directory",
				inputSchema: {
					type: "object",
					properties: { path: {
						type: "string",
						description: "Path to the directory relative to selected directory (empty for root)"
					} },
					required: []
				}
			},
			{
				name: "fs_create_directory",
				description: "Create a new directory",
				inputSchema: {
					type: "object",
					properties: { path: {
						type: "string",
						description: "Path to the directory to create relative to selected directory"
					} },
					required: ["path"]
				}
			},
			{
				name: "fs_delete_file",
				description: "Delete a file",
				inputSchema: {
					type: "object",
					properties: { path: {
						type: "string",
						description: "Path to the file to delete relative to selected directory"
					} },
					required: ["path"]
				}
			},
			{
				name: "fs_search_files",
				description: "Search for files by name pattern or content",
				inputSchema: {
					type: "object",
					properties: {
						pattern: {
							type: "string",
							description: "Search pattern (supports glob patterns like *.js, test*)"
						},
						content: {
							type: "string",
							description: "Search for files containing this text"
						},
						path: {
							type: "string",
							description: "Directory to search in (default: root)"
						},
						maxDepth: {
							type: "number",
							description: "Maximum depth to search (default: 10)"
						},
						caseSensitive: {
							type: "boolean",
							description: "Case sensitive search (default: false)"
						}
					},
					required: []
				}
			},
			{
				name: "fs_copy_file",
				description: "Copy a file to another location",
				inputSchema: {
					type: "object",
					properties: {
						source: {
							type: "string",
							description: "Source file path"
						},
						destination: {
							type: "string",
							description: "Destination file path"
						}
					},
					required: ["source", "destination"]
				}
			},
			{
				name: "fs_move_file",
				description: "Move/rename a file",
				inputSchema: {
					type: "object",
					properties: {
						source: {
							type: "string",
							description: "Source file path"
						},
						destination: {
							type: "string",
							description: "Destination file path"
						}
					},
					required: ["source", "destination"]
				}
			},
			{
				name: "fs_get_file_info",
				description: "Get detailed information about a file",
				inputSchema: {
					type: "object",
					properties: { path: {
						type: "string",
						description: "Path to the file"
					} },
					required: ["path"]
				}
			},
			{
				name: "fs_watch_directory",
				description: "Watch a directory for changes",
				inputSchema: {
					type: "object",
					properties: { path: {
						type: "string",
						description: "Directory to watch (default: root)"
					} },
					required: []
				}
			},
			{
				name: "fs_find_duplicates",
				description: "Find duplicate files by content or name",
				inputSchema: {
					type: "object",
					properties: {
						path: {
							type: "string",
							description: "Directory to search in (default: root)"
						},
						byContent: {
							type: "boolean",
							description: "Compare by content hash (default: false, compares by name)"
						}
					},
					required: []
				}
			},
			{
				name: "fs_tree_view",
				description: "Get a tree view of the directory structure",
				inputSchema: {
					type: "object",
					properties: {
						path: {
							type: "string",
							description: "Root path for tree view (default: root)"
						},
						maxDepth: {
							type: "number",
							description: "Maximum depth to display (default: 5)"
						},
						showHidden: {
							type: "boolean",
							description: "Show hidden files (default: false)"
						}
					},
					required: []
				}
			}
		];
	}
	async callTool(e, t) {
		try {
			switch (e) {
				case "fs_read_file": return await this.readFile(t.path);
				case "fs_write_file": return await this.writeFile(t.path, t.content);
				case "fs_list_directory": return await this.listDirectory(t.path || "");
				case "fs_create_directory": return await this.createDirectory(t.path);
				case "fs_delete_file": return await this.deleteFile(t.path);
				case "fs_search_files": return await this.searchFiles(t);
				case "fs_copy_file": return await this.copyFile(t.source, t.destination);
				case "fs_move_file": return await this.moveFile(t.source, t.destination);
				case "fs_get_file_info": return await this.getFileInfo(t.path);
				case "fs_find_duplicates": return await this.findDuplicates(t.path || "", t.byContent || !1);
				case "fs_tree_view": return await this.getTreeView(t.path || "", t.maxDepth || 5, t.showHidden || !1);
				default: return [{
					type: "text",
					text: `Unknown tool: ${e}`
				}];
			}
		} catch (e) {
			return [{
				type: "text",
				text: `Error: ${e.message}`
			}];
		}
	}
	async readFile(e) {
		if (!this.directoryHandle) return [{
			type: "text",
			text: "No directory available. Directory selection may have been cancelled or failed."
		}];
		let t = await (await this.getFileHandle(e)).getFile();
		if (t.size === 0) return [{
			type: "text",
			text: "File is empty"
		}];
		let n = 1e5;
		if (t.name.endsWith(".pdf")) return await this.readFileAsPDF(t, n);
		let r = this.detectFileEncoding(t);
		try {
			return r === "base64" ? await this.readFileAsBase64(t, 0, 5242880) : await this.readFileAsText(t, 0, n);
		} catch (e) {
			return [{
				type: "text",
				text: `Error reading file: ${e.message}. Only text/code files and images are supported.`
			}];
		}
	}
	async readFileAsPDF(e, t) {
		let { convertPdfToImages: n } = await import("./pdf-9kgFZuZc.js"), r = await n(await e.arrayBuffer(), {
			scale: 1.5,
			format: "jpeg",
			quality: .8
		});
		if (r.length === 0) return [{
			type: "text",
			text: "No images extracted from PDF"
		}];
		let i = [];
		for (let e of r) i.push({
			type: "image",
			data: e,
			mimeType: "image/jpeg"
		});
		return i;
	}
	detectFileEncoding(e) {
		let t = e.type.toLowerCase(), n = e.name.toLowerCase();
		return ["image/"].some((e) => t.startsWith(e)) || [
			".jpg",
			".jpeg",
			".png",
			".gif",
			".bmp",
			".webp",
			".svg",
			".ico"
		].some((e) => n.endsWith(e)) ? "base64" : "text";
	}
	async readFileAsText(e, t, n) {
		let r;
		if (t === 0 && e.size <= n) r = await e.text();
		else {
			let i = Math.min(t + n, e.size);
			r = await e.slice(t, i).text();
		}
		let i = t + r.length < e.size, a = [];
		return t > 0 && a.push(`Reading from byte ${t}`), i && a.push(`Content truncated (showing ${r.length} of ${e.size - t} remaining bytes)`), [{
			type: "text",
			text: a.length > 0 ? `${a.join(", ")}\n\n${r}` : r
		}];
	}
	async readFileAsBase64(e, t, n) {
		let r;
		if (t === 0 && e.size <= n) r = await e.arrayBuffer();
		else {
			let i = Math.min(t + n, e.size);
			r = await e.slice(t, i).arrayBuffer();
		}
		let i = new Uint8Array(r), a = btoa(String.fromCharCode(...i)), o = t + r.byteLength < e.size, s = [`File type: ${e.type || "unknown"}`, `Size: ${this.formatBytes(e.size)}`];
		return t > 0 && s.push(`Reading from byte ${t}`), o && s.push(`Content truncated (showing ${r.byteLength} of ${e.size - t} remaining bytes)`), [{
			type: "image",
			data: a,
			mimeType: e.type || "application/octet-stream"
		}];
	}
	async writeFile(e, t) {
		if (!this.directoryHandle) return [{
			type: "text",
			text: "No directory selected. Use fs_select_directory first."
		}];
		let n = await (await this.getFileHandle(e, !0)).createWritable();
		return await n.write(t), await n.close(), [{
			type: "text",
			text: `Successfully wrote ${t.length} characters to ${e}`
		}];
	}
	async listDirectory(e) {
		if (!this.directoryHandle) return [{
			type: "text",
			text: "No directory selected. Use fs_select_directory first."
		}];
		let t = e ? await this.getDirectoryHandle(e) : this.directoryHandle, n = [];
		for await (let [e, r] of t.entries()) {
			let t = r.kind === "directory" ? "[DIR]" : "[FILE]";
			n.push(`${t} ${e}`);
		}
		return [{
			type: "text",
			text: n.length > 0 ? n.join("\n") : "Directory is empty"
		}];
	}
	async createDirectory(e) {
		return this.directoryHandle ? (await this.getDirectoryHandle(e, !0), [{
			type: "text",
			text: `Successfully created directory: ${e}`
		}]) : [{
			type: "text",
			text: "No directory selected. Use fs_select_directory first."
		}];
	}
	async deleteFile(e) {
		if (!this.directoryHandle) return [{
			type: "text",
			text: "No directory selected. Use fs_select_directory first."
		}];
		let t = e.split("/").filter((e) => e.length > 0), n = t.pop(), r = this.directoryHandle;
		for (let e of t) r = await r.getDirectoryHandle(e);
		return await r.removeEntry(n), [{
			type: "text",
			text: `Successfully deleted: ${e}`
		}];
	}
	async getFileHandle(e, t = !1) {
		let n = e.split("/").filter((e) => e.length > 0), r = n.pop(), i = this.directoryHandle;
		for (let e of n) i = await i.getDirectoryHandle(e, { create: t });
		return await i.getFileHandle(r, { create: t });
	}
	async getDirectoryHandle(e, t = !1) {
		let n = e.split("/").filter((e) => e.length > 0), r = this.directoryHandle;
		for (let e of n) r = await r.getDirectoryHandle(e, { create: t });
		return r;
	}
	async searchFiles(e) {
		if (!this.directoryHandle) return [{
			type: "text",
			text: "No directory available. Directory selection may have been cancelled or failed."
		}];
		let t = e.path || "", n = e.maxDepth || 10, r = e.caseSensitive || !1, i = [], a = t ? await this.getDirectoryHandle(t) : this.directoryHandle;
		return await this.searchInDirectory(a, e.pattern, e.content, "", n, r, i), [{
			type: "text",
			text: i.length > 0 ? `Found ${i.length} matches:\n${i.join("\n")}` : "No matches found"
		}];
	}
	async searchInDirectory(e, t, n, r = "", i = 10, a = !1, o = []) {
		if (!(i <= 0)) for await (let [s, c] of e.entries()) {
			let e = r ? `${r}/${s}` : s;
			if (c.kind === "file") {
				let r = !1;
				if (t && (r = this.globToRegex(t, a).test(s)), !r && n) try {
					let e = await (await c.getFile()).text(), t = a ? e : e.toLowerCase(), i = a ? n : n.toLowerCase();
					r = t.includes(i);
				} catch {}
				(r || !t && !n) && o.push(e);
			} else c.kind === "directory" && await this.searchInDirectory(c, t, n, e, i - 1, a, o);
		}
	}
	globToRegex(e, t) {
		let n = e.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, "."), r = t ? "" : "i";
		return RegExp(`^${n}$`, r);
	}
	async copyFile(e, t) {
		if (!this.directoryHandle) return [{
			type: "text",
			text: "No directory available. Directory selection may have been cancelled or failed."
		}];
		let n = await (await (await this.getFileHandle(e)).getFile()).arrayBuffer(), r = await (await this.getFileHandle(t, !0)).createWritable();
		return await r.write(n), await r.close(), [{
			type: "text",
			text: `Successfully copied ${e} to ${t}`
		}];
	}
	async moveFile(e, t) {
		return this.directoryHandle ? (await this.copyFile(e, t), await this.deleteFile(e), [{
			type: "text",
			text: `Successfully moved ${e} to ${t}`
		}]) : [{
			type: "text",
			text: "No directory available. Directory selection may have been cancelled or failed."
		}];
	}
	async getFileInfo(e) {
		if (!this.directoryHandle) return [{
			type: "text",
			text: "No directory available. Directory selection may have been cancelled or failed."
		}];
		try {
			let t = await (await this.getFileHandle(e)).getFile();
			return [{
				type: "text",
				text: [
					`File: ${e}`,
					`Name: ${t.name}`,
					`Size: ${this.formatBytes(t.size)}`,
					`Type: ${t.type || "Unknown"}`,
					`Last Modified: ${new Date(t.lastModified).toLocaleString()}`
				].join("\n")
			}];
		} catch {
			try {
				let t = await this.getDirectoryHandle(e), n = 0, r = 0;
				for await (let [e, i] of t.entries()) i.kind === "file" ? n++ : r++;
				return [{
					type: "text",
					text: [
						`Directory: ${e}`,
						`Files: ${n}`,
						`Subdirectories: ${r}`
					].join("\n")
				}];
			} catch {
				return [{
					type: "text",
					text: `Path not found: ${e}`
				}];
			}
		}
	}
	formatBytes(e) {
		if (e === 0) return "0 Bytes";
		let t = 1024, n = [
			"Bytes",
			"KB",
			"MB",
			"GB"
		], r = Math.floor(Math.log(e) / Math.log(t));
		return parseFloat((e / t ** +r).toFixed(2)) + " " + n[r];
	}
	async findDuplicates(e, t) {
		if (!this.directoryHandle) return [{
			type: "text",
			text: "No directory available. Directory selection may have been cancelled or failed."
		}];
		let n = e ? await this.getDirectoryHandle(e) : this.directoryHandle, r = [];
		if (await this.collectFiles(n, "", r), t) {
			let e = /* @__PURE__ */ new Map();
			for (let t of r) try {
				let n = await (await (await this.getFileHandle(t.path)).getFile()).arrayBuffer(), r = await this.generateHash(n);
				e.has(r) || e.set(r, []), e.get(r).push(t.path);
			} catch {}
			let t = [];
			for (let [n, r] of e) r.length > 1 && (t.push(`Duplicate content (${r.length} files):`), r.forEach((e) => t.push(`  ${e}`)), t.push(""));
			return [{
				type: "text",
				text: t.length > 0 ? t.join("\n") : "No duplicate files found by content"
			}];
		} else {
			let e = /* @__PURE__ */ new Map();
			for (let t of r) e.has(t.name) || e.set(t.name, []), e.get(t.name).push(t.path);
			let t = [];
			for (let [n, r] of e) r.length > 1 && (t.push(`Duplicate name "${n}" (${r.length} files):`), r.forEach((e) => t.push(`  ${e}`)), t.push(""));
			return [{
				type: "text",
				text: t.length > 0 ? t.join("\n") : "No duplicate files found by name"
			}];
		}
	}
	async collectFiles(e, t, n) {
		for await (let [r, i] of e.entries()) {
			let e = t ? `${t}/${r}` : r;
			i.kind === "file" ? n.push({
				path: e,
				name: r
			}) : i.kind === "directory" && await this.collectFiles(i, e, n);
		}
	}
	async generateHash(e) {
		let t = await crypto.subtle.digest("SHA-256", e);
		return Array.from(new Uint8Array(t)).map((e) => e.toString(16).padStart(2, "0")).join("");
	}
	async getTreeView(e, t, n) {
		if (!this.directoryHandle) return [{
			type: "text",
			text: "No directory available. Directory selection may have been cancelled or failed."
		}];
		let r = e ? await this.getDirectoryHandle(e) : this.directoryHandle, i = [];
		return await this.buildTree(r, "", t, n, i), [{
			type: "text",
			text: i.length > 0 ? i.join("\n") : "Empty directory"
		}];
	}
	async buildTree(e, t, n, r, i) {
		if (n <= 0) return;
		let a = [];
		for await (let t of e.entries()) a.push(t);
		let o = r ? a : a.filter(([e]) => !e.startsWith("."));
		o.sort(([e, t], [n, r]) => t.kind === r.kind ? e.localeCompare(n) : t.kind === "directory" ? -1 : 1);
		for (let e = 0; e < o.length; e++) {
			let [a, s] = o[e], c = e === o.length - 1, l = c ? "└── " : "├── ", u = s.kind === "directory" ? "📁 " : "📄 ";
			if (i.push(`${t}${l}${u}${a}`), s.kind === "directory") {
				let e = t + (c ? "    " : "│   ");
				await this.buildTree(s, e, n - 1, r, i);
			}
		}
	}
};
//#endregion
export { t as FileSystemClient };
