import { Li as e, Ri as t, ki as n } from "./characterCards-BhA9VRBa.js";
import { t as r } from "./internalmcp-BEm-hL3W.js";
//#region src/ts/process/mcp/graphmem.ts
var i = class extends r {
	constructor() {
		super("internal:graphmem"), this.serverInfo.serverInfo.name = "GraphMem", this.serverInfo.serverInfo.version = "1.0.0", this.serverInfo.instructions = "Memory management using graph database.";
	}
	async getToolList() {
		return [{
			name: "writeMemory",
			description: "Write a memory entry to the graph database.",
			inputSchema: {
				type: "object",
				properties: {
					name: {
						type: "string",
						description: "The name of the memory entry."
					},
					summary: {
						type: "string",
						description: "A brief summary of the memory entry."
					},
					connections: {
						type: "array",
						items: {
							type: "string",
							description: "Names of related memory entries."
						},
						description: "Connections to other memory entries."
					}
				},
				required: ["name", "summary"]
			}
		}, {
			name: "readMemory",
			description: "Read a memory entry from the graph database.",
			inputSchema: {
				type: "object",
				properties: {
					query: {
						type: "array",
						items: { type: "string" },
						description: "The query terms to search for memory entries."
					},
					search_depth: {
						type: "number",
						description: "The depth of connections to explore in the graph. default is 2."
					}
				},
				required: ["query"]
			}
		}];
	}
	async callTool(e, t) {
		try {
			switch (e) {
				case "writeMemory": return await this.handleWriteMemory(t);
				case "readMemory": return await this.handleReadMemory(t);
				default: return [{
					type: "text",
					text: `Unknown tool: ${e}`
				}];
			}
		} catch (e) {
			return [{
				type: "text",
				text: `Error: ${e instanceof Error ? e.message : "Unknown error occurred"}`
			}];
		}
	}
	async handleWriteMemory(n) {
		let { name: r, summary: i, connections: a = [] } = n, o = [];
		try {
			o = JSON.parse(e("graphmem_graph"));
		} catch {}
		return o.push({
			name: r,
			summary: i,
			connections: a
		}), t("graphmem_graph", JSON.stringify(o)), [{
			type: "text",
			text: `Memory entry "${r}" written successfully.`
		}];
	}
	async handleReadMemory(t) {
		let { query: r, search_depth: i = 2 } = t, a = [];
		try {
			a = JSON.parse(e("graphmem_graph"));
		} catch {}
		if (!Array.isArray(r) || r.length === 0) return [{
			type: "text",
			text: "Query must be a non-empty array of strings."
		}];
		if (!Array.isArray(a) || a.length === 0) return [{
			type: "text",
			text: "No memory entries found in the graph database."
		}];
		let o = new n();
		await o.embedDocuments(a.map((e) => e.name));
		let s = [];
		for (let e = 0; e < r.length; e++) {
			let t = [], n = [r[e]];
			for (let e = 0; e < i; e++) {
				let e = [];
				for (let r of n) {
					let n = await o.similaritySearch(r);
					for (let r of n) {
						let n = a.find((e) => e.name === r);
						n && !t.includes(n) && e.push(n);
					}
				}
				t = t.concat(e), n = e.flatMap((e) => e.connections);
			}
			s.push({
				queryTerm: r[e],
				entries: t
			});
		}
		return [{
			type: "text",
			text: JSON.stringify(s, null, 2)
		}];
	}
};
//#endregion
export { i as GraphMemClient };
