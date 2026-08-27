import { Fi as e, Lt as t, g as n, k as r, y as i, zi as a } from "./characterCards-BhA9VRBa.js";
import { t as o } from "./internalmcp-BEm-hL3W.js";
//#region src/ts/process/mcp/risuaccess/utils.ts
function s(e) {
	return e ? t.db.characters.find((t) => t.chaId === e || t.name === e) : r();
}
//#endregion
//#region src/ts/process/mcp/risuaccess/characters.ts
var c = class extends e {
	promptAccess(e, t) {
		return n(a.mcpAccessPrompt.replace("{{tool}}", e).replace("{{action}}", t));
	}
	getTools() {
		return [
			{
				description: "Get basic information about a Risuai character.",
				inputSchema: {
					properties: {
						fields: {
							description: "Specific fields to include in the result.",
							items: {
								enum: [
									"alternateGreetings",
									"backgroundEmbedding",
									"description",
									"greeting",
									"id",
									"name",
									"replaceGlobalNote"
								],
								type: "string"
							},
							type: "array"
						},
						id: {
							description: "The ID or name of the character. Use an empty string for the currently selected character.",
							type: "string"
						}
					},
					required: ["id"],
					type: "object"
				},
				name: "risu-get-character-info"
			},
			{
				description: "List the lorebooks of a Risuai character.",
				inputSchema: {
					properties: {
						count: {
							default: 100,
							description: "The maximum number of lorebooks to return.",
							type: "integer"
						},
						id: {
							description: "The ID or name of the character. Use an empty string for the currently selected character.",
							type: "string"
						},
						offset: {
							description: "The number of lorebooks to skip for pagination.",
							type: "integer"
						}
					},
					required: ["id"],
					type: "object"
				},
				name: "risu-list-character-lorebooks"
			},
			{
				description: "Get lorebooks with specific names from a Risuai character.",
				inputSchema: {
					properties: {
						id: {
							description: "The ID or name of the character. Use an empty string for the currently selected character.",
							type: "string"
						},
						names: {
							description: "The names of the lorebooks to retrieve.",
							items: { type: "string" },
							type: "array"
						}
					},
					required: ["id", "names"],
					type: "object"
				},
				name: "risu-get-character-lorebook"
			},
			{
				description: "Set basic information about a Risuai character.",
				inputSchema: {
					properties: {
						data: {
							description: "A map of fields to their new values.",
							properties: {
								alternateGreetings: {
									items: { type: "string" },
									type: "array"
								},
								backgroundEmbedding: { type: "string" },
								description: { type: "string" },
								greeting: { type: "string" },
								name: { type: "string" },
								replaceGlobalNote: { type: "string" }
							},
							type: "object"
						},
						id: {
							description: "The ID or name of the character. Use an empty string for the currently selected character.",
							type: "string"
						}
					},
					required: ["data", "id"],
					type: "object"
				},
				name: "risu-set-character-info"
			},
			{
				description: "Update an existing lorebook of a Risuai character, or create a new one if it does not exist.",
				inputSchema: {
					properties: {
						alwaysActive: {
							default: !1,
							description: "If true, the lorebook is always active regardless of keywords.",
							type: "boolean"
						},
						content: {
							description: "The text content to be inserted into the context.",
							type: "string"
						},
						id: {
							description: "The ID or name of the character. Use an empty string for the currently selected character.",
							type: "string"
						},
						keys: {
							description: "An array of keywords that activate this lorebook.",
							items: { type: "string" },
							type: "array"
						},
						name: {
							description: "The name of the lorebook to update.",
							type: "string"
						},
						newName: {
							description: "Optional new name for the lorebook.",
							type: "string"
						}
					},
					required: ["id", "name"],
					type: "object"
				},
				name: "risu-set-character-lorebook"
			},
			{
				description: "Delete a lorebook from a Risuai character.",
				inputSchema: {
					properties: {
						id: {
							description: "The ID or name of the character. Use an empty string for the currently selected character.",
							type: "string"
						},
						name: {
							description: "The name of the lorebook to delete.",
							type: "string"
						}
					},
					required: ["id", "name"],
					type: "object"
				},
				name: "risu-delete-character-lorebook"
			},
			{
				description: "Get regex scripts from a Risuai character.",
				inputSchema: {
					properties: { id: {
						description: "The ID or name of the character. Use an empty string for the currently selected character.",
						type: "string"
					} },
					required: ["id"],
					type: "object"
				},
				name: "risu-get-character-regex-scripts"
			},
			{
				description: "Update an existing regex script in a Risuai character, or create a new one if it does not exist.",
				inputSchema: {
					properties: {
						ableFlag: {
							default: !1,
							description: "Set to true to use the custom \"flag\" string.",
							type: "boolean"
						},
						flag: {
							description: "Regex flags (e.g., \"g\", \"i\", \"m\") used when \"ableFlag\" is true.",
							type: "string"
						},
						id: {
							description: "The ID or name of the character. Use an empty string for the currently selected character.",
							type: "string"
						},
						in: {
							description: "The regex pattern to match.",
							type: "string"
						},
						name: {
							description: "The name of the script to update.",
							type: "string"
						},
						newName: {
							description: "Optional new name for the script.",
							type: "string"
						},
						out: {
							description: "The string to replace matches with.",
							type: "string"
						},
						type: {
							description: "The hook where the regex is applied.",
							enum: [
								"editdisplay",
								"editinput",
								"editoutput",
								"editprocess"
							],
							type: "string"
						}
					},
					required: ["id", "name"],
					type: "object"
				},
				name: "risu-set-character-regex-scripts"
			},
			{
				description: "Delete a regex script from a Risuai character.",
				inputSchema: {
					properties: {
						id: {
							description: "The ID or name of the character. Use an empty string for the currently selected character.",
							type: "string"
						},
						name: {
							description: "The name of the regex script to delete.",
							type: "string"
						}
					},
					required: ["id", "name"],
					type: "object"
				},
				name: "risu-delete-character-regex-scripts"
			},
			{
				description: "Get additional assets from a Risuai character.",
				inputSchema: {
					properties: { id: {
						description: "The ID or name of the character. Use an empty string for the currently selected character.",
						type: "string"
					} },
					required: ["id"],
					type: "object"
				},
				name: "risu-get-character-additional-assets"
			},
			{
				description: "Get the Lua script from a Risuai character trigger.",
				inputSchema: {
					properties: { id: {
						description: "The ID or name of the character. Use an empty string for the currently selected character.",
						type: "string"
					} },
					required: ["id"],
					type: "object"
				},
				name: "risu-get-character-lua-script"
			},
			{
				description: "Update the Lua script of a Risuai character.",
				inputSchema: {
					properties: {
						code: {
							description: "The new Lua code.",
							type: "string"
						},
						id: {
							description: "The ID or name of the character. Use an empty string for the currently selected character.",
							type: "string"
						}
					},
					required: ["code", "id"],
					type: "object"
				},
				name: "risu-set-character-lua-script"
			},
			{
				description: "Delete an additional asset from a Risuai character.",
				inputSchema: {
					properties: {
						assetName: {
							description: "The name of the asset to delete.",
							type: "string"
						},
						id: {
							description: "The ID or name of the character. Use an empty string for the currently selected character.",
							type: "string"
						}
					},
					required: ["assetName", "id"],
					type: "object"
				},
				name: "risu-delete-character-additional-assets"
			},
			{
				description: "List all Risuai characters.",
				inputSchema: {
					properties: {
						count: {
							default: 100,
							description: "The maximum number of characters to return.",
							type: "integer"
						},
						offset: {
							description: "The number of characters to skip for pagination.",
							type: "integer"
						}
					},
					required: [],
					type: "object"
				},
				name: "risu-list-characters"
			}
		];
	}
	async handle(e, t) {
		switch (e) {
			case "risu-get-character-info": return await this.getCharacterInfo(t.id, t.fields);
			case "risu-list-character-lorebooks": return await this.getCharacterLorebooks(t.id, t.count, t.offset);
			case "risu-get-character-lorebook": return await this.getCharacterLorebook(t.id, t.names);
			case "risu-set-character-info": return await this.setCharacterInfo(t.id, t.data);
			case "risu-set-character-lorebook": return await this.setCharacterLorebook(t.id, t.name, t.content, t.keys, t.newName, t.alwaysActive);
			case "risu-delete-character-lorebook": return await this.deleteCharacterLorebook(t.id, t.name);
			case "risu-get-character-regex-scripts": return await this.getCharacterRegexScripts(t.id);
			case "risu-set-character-regex-scripts": return await this.setCharacterRegexScripts(t.id, t.name, t.newName, t.in, t.out, t.type, t.flag, t.ableFlag);
			case "risu-delete-character-regex-scripts": return await this.deleteCharacterRegexScripts(t.id, t.name);
			case "risu-get-character-additional-assets": return await this.getCharacterAdditionalAssets(t.id);
			case "risu-get-character-lua-script": return await this.getCharacterLuaScript(t.id);
			case "risu-set-character-lua-script": return await this.setCharacterLuaScript(t.id, t.code);
			case "risu-delete-character-additional-assets": return await this.deleteCharacterAdditionalAssets(t.id, t.assetName);
			case "risu-list-characters": return await this.listCharacters(t.count, t.offset);
		}
		return null;
	}
	async getCharacterInfo(e, t) {
		let n = s(e);
		if (!n) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (n.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		let r = {}, i = {
			name: "name",
			greeting: "firstMessage",
			description: "desc",
			id: "chaId",
			replaceGlobalNote: "replaceGlobalNote",
			alternateGreetings: "alternateGreetings",
			backgroundEmbedding: "backgroundHTML"
		};
		for (let e of t) if (i[e]) r[e] = n[i[e]];
		else return [{
			type: "text",
			text: `Error: Field ${e} does not exist on character ${n.chaId} or it isn't allowed to be accessed.`
		}];
		return [{
			type: "text",
			text: JSON.stringify(r)
		}];
	}
	async getCharacterLorebooks(e, t = 100, n = 0) {
		let r = s(e);
		if (!r) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (r.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		t > 100 && (t = 100), t < 1 && (t = 1), n < 0 && (n = 0);
		let a = r.globalLore.slice(n, n + t).map((e) => ({
			alwaysActive: e.alwaysActive,
			keys: e.key,
			name: e.comment || "Unnamed " + i(5515, e.content)
		}));
		return [{
			type: "text",
			text: JSON.stringify(a)
		}];
	}
	async getCharacterLorebook(e, t) {
		let n = s(e);
		if (!n) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (n.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		let r = n.globalLore.filter((e) => {
			let n = e.comment || "Unnamed " + i(5515, e.content);
			return t.includes(n);
		});
		if (r.length === 0) return [{
			type: "text",
			text: `Error: Lorebook entries with names "${t.join(", ")}" not found.`
		}];
		let a = r.map((e) => ({
			alwaysActive: e.alwaysActive,
			content: e.content,
			keys: e.key,
			name: e.comment || "Unnamed " + i(5515, e.content)
		}));
		return [{
			type: "text",
			text: JSON.stringify(a)
		}];
	}
	async setCharacterInfo(e, t) {
		let n = s(e);
		if (!n) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (n.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		if (!await this.promptAccess("risu-set-character-info", `modify character (${n.name}) information`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		let r = {
			name: "name",
			greeting: "firstMessage",
			description: "desc",
			replaceGlobalNote: "replaceGlobalNote",
			alternateGreetings: "alternateGreetings",
			backgroundEmbedding: "backgroundHTML"
		};
		for (let [e, i] of Object.entries(t)) if (r[e]) {
			let t = r[e];
			n[t] = i;
		} else return [{
			type: "text",
			text: `Error: Field ${e} does not exist on character ${n.chaId} or it isn't allowed to be modified.`
		}];
		return [{
			type: "text",
			text: `Successfully updated character ${n.name || n.chaId}`
		}];
	}
	async setCharacterLorebook(e, t, n, r, a, o) {
		let c = s(e);
		if (!c) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (c.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		if (!await this.promptAccess("risu-set-character-lorebook", `add/modify character (${c.name}) global lorebook (${t})`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		let l = c.globalLore.findIndex((e) => (e.comment || "Unnamed " + i(5515, e.content)) === t);
		if (l === -1) {
			let e = {
				key: o ? "" : r?.join(",") || "",
				content: n || "",
				comment: a || t,
				alwaysActive: o || !1,
				secondkey: "",
				selective: !1,
				insertorder: 100,
				mode: "normal"
			};
			return c.globalLore.push(e), [{
				type: "text",
				text: `Successfully added lorebook entry "${a || t}" to character ${c.name || c.chaId}`
			}];
		}
		let u = c.globalLore[l];
		return n !== void 0 && (u.content = n), r !== void 0 && (u.key = o ? "" : r.join(",")), a !== void 0 && (u.comment = a), o !== void 0 && (u.alwaysActive = o, o && (u.key = "")), [{
			type: "text",
			text: `Successfully updated lorebook entry "${t}" for character ${c.name || c.chaId}`
		}];
	}
	async deleteCharacterLorebook(e, t) {
		let n = s(e);
		if (!n) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (n.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		if (!await this.promptAccess("risu-delete-character-lorebook", `delete character (${n.name}) global lorebook (${t})`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		let r = n.globalLore.findIndex((e) => (e.comment || "Unnamed " + i(5515, e.content)) === t);
		return r === -1 ? [{
			type: "text",
			text: `Error: Lorebook entry with name "${t}" not found.`
		}] : (n.globalLore.splice(r, 1), [{
			type: "text",
			text: `Successfully deleted lorebook entry "${t}" from character ${n.name || n.chaId}`
		}]);
	}
	async getCharacterRegexScripts(e) {
		let t = s(e);
		if (!t) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (t.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		let n = (t.customscript || []).map((e) => ({
			comment: e.comment || "Unnamed " + i(5515, e.in + e.out),
			in: e.in,
			out: e.out,
			type: e.type,
			flag: e.flag,
			ableFlag: e.ableFlag
		}));
		return [{
			type: "text",
			text: JSON.stringify(n)
		}];
	}
	async setCharacterRegexScripts(e, t, n, r, a, o, c, l) {
		let u = s(e);
		if (!u) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (u.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		if (!await this.promptAccess("risu-set-character-regex-scripts", `add/modify character (${u.name}) regex script (${t})`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		u.customscript ||= [];
		let d = u.customscript.findIndex((e) => (e.comment || "Unnamed " + i(5515, e.in + e.out)) === t);
		if (d === -1) {
			let e = {
				comment: n || t,
				in: r || "",
				out: a || "",
				type: o || "editdisplay",
				flag: c || "",
				ableFlag: l === void 0 ? !0 : l
			};
			return u.customscript.push(e), [{
				type: "text",
				text: `Successfully added regex script "${n || t}" to character ${u.name || u.chaId}`
			}];
		}
		let f = u.customscript[d];
		return n !== void 0 && (f.comment = n), r !== void 0 && (f.in = r), a !== void 0 && (f.out = a), o !== void 0 && (f.type = o), c !== void 0 && (f.flag = c), l !== void 0 && (f.ableFlag = l), [{
			type: "text",
			text: `Successfully updated regex script "${t}" for character ${u.name || u.chaId}`
		}];
	}
	async deleteCharacterRegexScripts(e, t) {
		let n = s(e);
		if (!n) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (n.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		if (!await this.promptAccess("risu-delete-character-regex-scripts", `delete character (${n.name}) regex script (${t})`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		n.customscript ||= [];
		let r = n.customscript.findIndex((e) => (e.comment || "Unnamed " + i(5515, e.in + e.out)) === t);
		return r === -1 ? [{
			type: "text",
			text: `Error: Regex script with name "${t}" not found.`
		}] : (n.customscript.splice(r, 1), [{
			type: "text",
			text: `Successfully deleted regex script "${t}" from character ${n.name || n.chaId}`
		}]);
	}
	async getCharacterAdditionalAssets(e) {
		let t = s(e);
		if (!t) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (t.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		let n = (t.additionalAssets || []).map((e) => ({
			name: e[0] || "Unnamed " + i(5515, e[1] + e[2]),
			path: e[1],
			ext: e[2]
		}));
		return [{
			type: "text",
			text: JSON.stringify(n)
		}];
	}
	async deleteCharacterAdditionalAssets(e, t) {
		let n = s(e);
		if (!n) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (n.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		if (!await this.promptAccess("risu-delete-character-additional-assets", `delete character (${n.name}) additional asset (${t})`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		n.additionalAssets ||= [];
		let r = n.additionalAssets.findIndex((e) => (e[0] || "Unnamed " + i(5515, e[1] + e[2])) === t);
		return r === -1 ? [{
			type: "text",
			text: `Error: Additional asset with name "${t}" not found.`
		}] : (n.additionalAssets.splice(r, 1), [{
			type: "text",
			text: `Successfully deleted additional asset "${t}" from character ${n.name || n.chaId}`
		}]);
	}
	async getCharacterLuaScript(e) {
		let t = s(e);
		if (!t) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (t.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		let n = t.triggerscript?.[0];
		return n?.effect?.[0]?.type === "triggerlua" && n.effect[0].code.trim().length > 0 ? [{
			type: "text",
			text: n.effect[0].code
		}] : [{
			type: "text",
			text: "Error: This character does not contain a Lua trigger as the first trigger."
		}];
	}
	async setCharacterLuaScript(e, t) {
		let n = s(e);
		if (!n) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (n.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		if (!await this.promptAccess("risu-set-character-lua-script", `modify character (${n.name}) lua script`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		let r = n.triggerscript?.[0];
		return r?.effect?.[0]?.type === "triggerlua" ? (r.effect[0].code = t, [{
			type: "text",
			text: `Successfully updated Lua script for character ${n.name || n.chaId}`
		}]) : [{
			type: "text",
			text: "Error: User must first change the first trigger type to Lua manually."
		}];
	}
	async listCharacters(e = 100, n = 0) {
		e > 100 && (e = 100), e < 1 && (e = 1), n < 0 && (n = 0);
		let r = t.db.characters.slice(n, n + e).map((e) => ({
			id: e.chaId,
			name: e.name || "Unnamed",
			type: e.type
		}));
		return [{
			type: "text",
			text: JSON.stringify(r)
		}];
	}
}, l = class extends e {
	getTools() {
		return [{
			name: "risu-get-chat-history",
			description: "Get the chat history with user and a Risuai character. ordered by time, newest first.",
			inputSchema: {
				type: "object",
				properties: {
					id: {
						type: "string",
						description: "The ID or name of the Risuai character. This can be a character name or ID. if its blank string, it will use the current character."
					},
					count: {
						type: "integer",
						description: "The number of chat history entries to retrieve. maximum and default is 20.",
						default: 20
					},
					offset: {
						type: "integer",
						description: "The offset to start retrieving chat history entries from. This is useful for pagination."
					}
				},
				required: ["id"]
			}
		}];
	}
	async handle(e, t) {
		return e === "risu-get-chat-history" ? await this.getChatHistory(t.id, t.count, t.offset) : null;
	}
	async getChatHistory(e, t = 20, n = 0) {
		let r = s(e);
		if (!r) return [{
			type: "text",
			text: `Error: Character with ID ${e} not found.`
		}];
		if (r.type === "group") return [{
			type: "text",
			text: "Error: The id pointed to a group chat, not a character."
		}];
		t > 100 && (t = 100), t < 1 && (t = 1), n < 0 && (n = 0);
		let i = [...r.chats[r.chatPage].message].reverse().slice(n, n + t).map((e) => ({
			type: "text",
			text: `${e.role === "char" ? r.name : "User"}: ${e.data}`
		}));
		return [{
			type: "text",
			text: JSON.stringify(i)
		}];
	}
}, u = (e) => [{
	type: "text",
	text: `Error: Module with ID ${e} not found.`
}], d = class extends e {
	promptAccess(e, t) {
		return n(a.mcpAccessPrompt.replace("{{tool}}", e).replace("{{action}}", t));
	}
	getTools() {
		return [
			{
				description: "List installed Risuai modules (excluding MCP modules).",
				inputSchema: {
					properties: {
						count: {
							default: 100,
							description: "The maximum number of modules to return.",
							maximum: 100,
							type: "integer"
						},
						offset: {
							description: "The number of modules to skip for pagination.",
							type: "integer"
						}
					},
					required: [],
					type: "object"
				},
				name: "risu-list-modules"
			},
			{
				description: "Get information about a specific Risuai module.",
				inputSchema: {
					properties: {
						fields: {
							description: "Specific fields to include in the result.",
							items: {
								enum: [
									"backgroundEmbedding",
									"customModuleToggle",
									"description",
									"enabled",
									"id",
									"lowLevelAccess",
									"name"
								],
								type: "string"
							},
							type: "array"
						},
						id: {
							description: "The ID of the module.",
							type: "string"
						}
					},
					required: ["id"],
					type: "object"
				},
				name: "risu-get-module-info"
			},
			{
				description: "Set information about a specific Risuai module.",
				inputSchema: {
					properties: {
						data: {
							description: "A map of fields to their new values.",
							properties: {
								backgroundEmbedding: { type: "string" },
								customModuleToggle: { type: "string" },
								description: { type: "string" },
								enabled: { type: "boolean" },
								lowLevelAccess: { type: "boolean" },
								name: { type: "string" }
							},
							type: "object"
						},
						id: {
							description: "The ID of the module.",
							type: "string"
						}
					},
					required: ["data", "id"],
					type: "object"
				},
				name: "risu-set-module-info"
			},
			{
				description: "List the lorebooks of a Risuai module.",
				inputSchema: {
					properties: {
						count: {
							default: 100,
							description: "The maximum number of lorebooks to return.",
							maximum: 100,
							type: "integer"
						},
						id: {
							description: "The ID of the module.",
							type: "string"
						},
						offset: {
							description: "The number of lorebooks to skip for pagination.",
							type: "integer"
						}
					},
					required: ["id"],
					type: "object"
				},
				name: "risu-list-module-lorebooks"
			},
			{
				description: "Get lorebooks with specific names from a Risuai module.",
				inputSchema: {
					properties: {
						id: {
							description: "The ID of the module.",
							type: "string"
						},
						names: {
							description: "The names of the lorebooks to retrieve.",
							items: { type: "string" },
							type: "array"
						}
					},
					required: ["id", "names"],
					type: "object"
				},
				name: "risu-get-module-lorebook"
			},
			{
				description: "Update an existing lorebook of a Risuai module, or create a new one if it does not exist.",
				inputSchema: {
					properties: {
						alwaysActive: {
							default: !1,
							description: "If true, the lorebook is always active regardless of keywords.",
							type: "boolean"
						},
						content: {
							description: "The text content to be inserted into the context.",
							type: "string"
						},
						id: {
							description: "The ID of the module.",
							type: "string"
						},
						keys: {
							description: "An array of keywords that activate this lorebook.",
							items: { type: "string" },
							type: "array"
						},
						name: {
							description: "The name of the lorebook to update.",
							type: "string"
						},
						newName: {
							description: "Optional new name for the lorebook.",
							type: "string"
						}
					},
					required: ["id", "name"],
					type: "object"
				},
				name: "risu-set-module-lorebook"
			},
			{
				description: "Delete a lorebook from a Risuai module.",
				inputSchema: {
					properties: {
						id: {
							description: "The ID of the module.",
							type: "string"
						},
						name: {
							description: "The name of the lorebook to delete.",
							type: "string"
						}
					},
					required: ["id", "name"],
					type: "object"
				},
				name: "risu-delete-module-lorebook"
			},
			{
				description: "Get regex scripts from a Risuai module.",
				inputSchema: {
					properties: { id: {
						description: "The ID of the module.",
						type: "string"
					} },
					required: ["id"],
					type: "object"
				},
				name: "risu-get-module-regex-scripts"
			},
			{
				description: "Update an existing regex script in a Risuai module, or create a new one if it does not exist.",
				inputSchema: {
					properties: {
						ableFlag: {
							default: !1,
							description: "Set to true to use the custom \"flag\" string.",
							type: "boolean"
						},
						flag: {
							description: "Regex flags (e.g., \"g\", \"i\", \"m\") used when \"ableFlag\" is true.",
							type: "string"
						},
						id: {
							description: "The ID of the module.",
							type: "string"
						},
						in: {
							description: "The regex pattern to match.",
							type: "string"
						},
						name: {
							description: "The name of the script to update.",
							type: "string"
						},
						newName: {
							description: "Optional new name for the script.",
							type: "string"
						},
						out: {
							description: "The string to replace matches with.",
							type: "string"
						},
						type: {
							description: "The hook where the regex is applied.",
							enum: [
								"editdisplay",
								"editinput",
								"editoutput",
								"editprocess"
							],
							type: "string"
						}
					},
					required: ["id", "name"],
					type: "object"
				},
				name: "risu-set-module-regex-script"
			},
			{
				description: "Delete a regex script from a Risuai module.",
				inputSchema: {
					properties: {
						id: {
							description: "The ID of the module.",
							type: "string"
						},
						name: {
							description: "The name of the regex script to delete.",
							type: "string"
						}
					},
					required: ["id", "name"],
					type: "object"
				},
				name: "risu-delete-module-regex-script"
			},
			{
				description: "Get the Lua script from a Risuai module trigger.",
				inputSchema: {
					properties: { id: {
						description: "The ID of the module.",
						type: "string"
					} },
					required: ["id"],
					type: "object"
				},
				name: "risu-get-module-lua-script"
			},
			{
				description: "Update the Lua script of a Risuai module.",
				inputSchema: {
					properties: {
						code: {
							description: "The new Lua code.",
							type: "string"
						},
						id: {
							description: "The ID of the module.",
							type: "string"
						}
					},
					required: ["code", "id"],
					type: "object"
				},
				name: "risu-set-module-lua-script"
			}
		];
	}
	async handle(e, t) {
		switch (e) {
			case "risu-list-modules": return await this.listModules(t.count, t.offset);
			case "risu-get-module-info": return await this.getModuleInfo(t.id, t.fields);
			case "risu-set-module-info": return await this.setModuleInfo(t.id, t.data);
			case "risu-list-module-lorebooks": return await this.listModuleLorebooks(t.id, t.count, t.offset);
			case "risu-get-module-lorebook": return await this.getModuleLorebook(t.id, t.names);
			case "risu-set-module-lorebook": return await this.setModuleLorebook(t.id, t.name, t.content, t.keys, t.newName, t.alwaysActive);
			case "risu-delete-module-lorebook": return await this.deleteModuleLorebook(t.id, t.name);
			case "risu-get-module-regex-scripts": return await this.getModuleRegexScripts(t.id);
			case "risu-set-module-regex-script": return await this.setModuleRegexScript(t.id, t.name, t.newName, t.in, t.out, t.type, t.flag, t.ableFlag);
			case "risu-delete-module-regex-script": return await this.deleteModuleRegexScript(t.id, t.name);
			case "risu-get-module-lua-script": return await this.getModuleLuaScript(t.id);
			case "risu-set-module-lua-script": return await this.setModuleLuaScript(t.id, t.code);
		}
		return null;
	}
	async listModules(e = 100, n = 0) {
		e > 100 && (e = 100), e < 1 && (e = 1), n < 0 && (n = 0);
		let r = t.db.modules.filter((e) => !e.mcp), i = new Set(t.db.enabledModules || []), a = r.slice(n, n + e).map((e) => ({
			id: e.id,
			name: e.name,
			description: e.description,
			enabled: i.has(e.id)
		}));
		return [{
			type: "text",
			text: JSON.stringify(a)
		}];
	}
	async getModuleInfo(e, n) {
		let r = t.db.modules.find((t) => t.id === e);
		if (!r || r.mcp) return u(e);
		let i = new Set(t.db.enabledModules || []), a = n && n.length > 0 ? n : [
			"name",
			"description",
			"id",
			"enabled"
		], o = new Set([
			"name",
			"description",
			"id",
			"enabled",
			"lowLevelAccess",
			"backgroundEmbedding",
			"customModuleToggle"
		]), s = {};
		for (let e of a) if (o.has(e)) if (e === "enabled") s.enabled = i.has(r.id);
		else {
			let t = r[e];
			t !== void 0 && (s[e] = t);
		}
		return [{
			type: "text",
			text: JSON.stringify(s)
		}];
	}
	async setModuleInfo(e, n) {
		let r = t.db.modules.find((t) => t.id === e);
		if (!r || r.mcp) return [{
			type: "text",
			text: `Error: Module with ID ${e} not found.`
		}];
		if (!await this.promptAccess("risu-set-module-info", `modify module (${r.name}) information`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		let i = [
			"name",
			"description",
			"enabled",
			"lowLevelAccess",
			"backgroundEmbedding",
			"customModuleToggle"
		];
		for (let [a, o] of Object.entries(n)) if (i.includes(a)) if (a === "enabled") {
			let n = new Set(t.db.enabledModules || []);
			o ? n.add(e) : n.delete(e), t.db.enabledModules = Array.from(n);
		} else r[a] = o;
		return [{
			type: "text",
			text: `Successfully updated module ${r.name || e}`
		}];
	}
	async listModuleLorebooks(e, n = 100, r = 0) {
		let a = t.db.modules.find((t) => t.id === e);
		if (!a || a.mcp) return u(e);
		n > 100 && (n = 100), n < 1 && (n = 1), r < 0 && (r = 0);
		let o = (a.lorebook || []).slice(r, r + n).map((e) => ({
			alwaysActive: e.alwaysActive,
			keys: e.key,
			name: e.comment || "Unnamed " + i(5515, e.content)
		}));
		return [{
			type: "text",
			text: JSON.stringify(o)
		}];
	}
	async getModuleLorebook(e, n) {
		let r = t.db.modules.find((t) => t.id === e);
		if (!r || r.mcp) return u(e);
		let a = (r.lorebook || []).filter((e) => {
			let t = e.comment || "Unnamed " + i(5515, e.content);
			return n.includes(t);
		});
		if (a.length === 0) return [{
			type: "text",
			text: `Error: Lorebook entries with names "${n.join(", ")}" not found.`
		}];
		let o = a.map((e) => ({
			alwaysActive: e.alwaysActive,
			content: e.content,
			keys: e.key,
			name: e.comment || "Unnamed " + i(5515, e.content)
		}));
		return [{
			type: "text",
			text: JSON.stringify(o)
		}];
	}
	async setModuleLorebook(e, n, r, a, o, s) {
		let c = t.db.modules.find((t) => t.id === e);
		if (!c || c.mcp) return u(e);
		if (!await this.promptAccess("risu-set-module-lorebook", `add/modify module (${c.name}) lorebook (${n})`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		c.lorebook ||= [];
		let l = c.lorebook.findIndex((e) => (e.comment || "Unnamed " + i(5515, e.content)) === n);
		if (l === -1) {
			let e = {
				key: s ? "" : a?.join(",") || "",
				content: r || "",
				comment: o || n,
				alwaysActive: s || !1,
				secondkey: "",
				selective: !1,
				insertorder: 100,
				mode: "normal"
			};
			return c.lorebook.push(e), [{
				type: "text",
				text: `Successfully added lorebook entry "${o || n}" to module ${c.name}`
			}];
		}
		let d = c.lorebook[l];
		return r !== void 0 && (d.content = r), a !== void 0 && (d.key = s ? "" : a.join(",")), o !== void 0 && (d.comment = o), s !== void 0 && (d.alwaysActive = s, s && (d.key = "")), [{
			type: "text",
			text: `Successfully updated lorebook entry "${n}" in module ${c.name}`
		}];
	}
	async deleteModuleLorebook(e, n) {
		let r = t.db.modules.find((t) => t.id === e);
		if (!r || r.mcp) return u(e);
		if (!await this.promptAccess("risu-delete-module-lorebook", `delete module (${r.name}) lorebook (${n})`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		r.lorebook ||= [];
		let a = r.lorebook.findIndex((e) => (e.comment || "Unnamed " + i(5515, e.content)) === n);
		return a === -1 ? [{
			type: "text",
			text: `Error: Lorebook entry with name "${n}" not found.`
		}] : (r.lorebook.splice(a, 1), [{
			type: "text",
			text: `Successfully deleted lorebook entry "${n}" from module ${r.name}`
		}]);
	}
	async getModuleRegexScripts(e) {
		let n = t.db.modules.find((t) => t.id === e);
		if (!n || n.mcp) return u(e);
		let r = (n.regex || []).map((e) => ({
			comment: e.comment || "Unnamed " + i(5515, e.in + e.out),
			in: e.in,
			out: e.out,
			type: e.type,
			flag: e.flag,
			ableFlag: e.ableFlag
		}));
		return [{
			type: "text",
			text: JSON.stringify(r)
		}];
	}
	async setModuleRegexScript(e, n, r, a, o, s, c, l) {
		let d = t.db.modules.find((t) => t.id === e);
		if (!d || d.mcp) return u(e);
		if (!await this.promptAccess("risu-set-module-regex-script", `add/modify module (${d.name}) regex script (${n})`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		d.regex ||= [];
		let f = d.regex.findIndex((e) => (e.comment || "Unnamed " + i(5515, e.in + e.out)) === n);
		if (f === -1) {
			let e = {
				comment: r || n,
				in: a || "",
				out: o || "",
				type: s || "editdisplay",
				flag: c || "",
				ableFlag: l === void 0 ? !0 : l
			};
			return d.regex.push(e), [{
				type: "text",
				text: `Successfully added regex script "${r || n}" to module ${d.name}`
			}];
		}
		let p = d.regex[f];
		return r !== void 0 && (p.comment = r), a !== void 0 && (p.in = a), o !== void 0 && (p.out = o), s !== void 0 && (p.type = s), c !== void 0 && (p.flag = c), l !== void 0 && (p.ableFlag = l), [{
			type: "text",
			text: `Successfully updated regex script "${n}" in module ${d.name}`
		}];
	}
	async deleteModuleRegexScript(e, n) {
		let r = t.db.modules.find((t) => t.id === e);
		if (!r || r.mcp) return u(e);
		if (!await this.promptAccess("risu-delete-module-regex-script", `delete module (${r.name}) regex script (${n})`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		r.regex ||= [];
		let a = r.regex.findIndex((e) => (e.comment || "Unnamed " + i(5515, e.in + e.out)) === n);
		return a === -1 ? [{
			type: "text",
			text: `Error: Regex script with name "${n}" not found.`
		}] : (r.regex.splice(a, 1), [{
			type: "text",
			text: `Successfully deleted regex script "${n}" from module ${r.name}`
		}]);
	}
	async getModuleLuaScript(e) {
		let n = t.db.modules.find((t) => t.id === e);
		if (!n || n.mcp) return u(e);
		let r = n.trigger?.[0];
		return r?.effect?.[0]?.type === "triggerlua" && r.effect[0].code.trim().length > 0 ? [{
			type: "text",
			text: r.effect[0].code
		}] : [{
			type: "text",
			text: "Error: This module does not contain a Lua trigger."
		}];
	}
	async setModuleLuaScript(e, n) {
		let r = t.db.modules.find((t) => t.id === e);
		if (!r || r.mcp) return u(e);
		if (!await this.promptAccess("risu-set-module-lua-script", `modify module (${r.name}) lua script`)) return [{
			type: "text",
			text: "Access denied by user."
		}];
		let i = r.trigger?.[0];
		return i?.effect?.[0]?.type === "triggerlua" ? (i.effect[0].code = n, [{
			type: "text",
			text: `Successfully updated Lua script for module ${r.name}`
		}]) : [{
			type: "text",
			text: "Error: User must first change the trigger type to Lua manually."
		}];
	}
}, f = class extends o {
	handlers;
	constructor() {
		super("internal:risuai"), this.serverInfo.serverInfo.name = "Risuai Access MCP", this.serverInfo.serverInfo.version = "1.0.0", this.serverInfo.instructions = "Risuai Access MCP provides access to Risuai's features and tools, which is the software currently running on. Use the available tools to interact with Risuai's functionalities.\n<About Risuai Features>\nCharacters are the AI personas that Risuai users chat with. Fields:\n- 'name': The name of the character.\n- 'greeting': The greeting message of the character. This is the first message that the character will send when the chat starts.\n- 'description': The description of the character. This is used to describe the character in the chat.\n- 'replaceGlobalNote': A note used to provide instructions to AI models (but not you).\n- 'alternateGreetings': An array of alternate greetings that the character can use.\n- 'backgroundEmbedding': See below.\n\nModules are independant packages of lorebooks and scripts. Fields:\n- 'name': The name of the module.\n- 'description': The description.\n- 'regex': Array of regex scripts.\n- 'trigger': Array of trigger scripts.\n- 'backgroundEmbedding': See below.\n- 'mcp': Optional MCP server URL.\n- 'lowLevelAccess': Must be true to allow LLM or network requests in Lua scripts.\n- 'customModuleToggle': User settings configuration, simply called \"toggles\". Format: key=label=type=options\n  - Types:\n    - (omit): Checkbox, '0'|'1'.\n    - select: Dropdown. Index of the selected option.\n    - text: Text input. User typed text.\n    - group, groupEnd: Collapsible group start and end. Keyless.\n    - divider. Keyless.\n  - Examples:\n    - booleanValue=Check Me\n    - selectValue=Select Me=select=opt1,opt2,opt3\n    - textValue=Type Me=text\n    - =Collapsible Group=groupStart\n    - =Optional Label=divider\n    - ==groupEnd\n\nRegex Scripts are used to replace text in the chat based on regex patterns. Fields:\n- 'type': The type of the script. One of:\n  - 'editinput': Modifies the user's input text.\n  - 'editoutput': Modifies the character's output text.\n  - 'editprocess': Modifies the text before sending the HTTP request.\n  - 'editdisplay': Modifies the text before displaying it in the chat.\n  - 'edittrans': Modifies the text after translation.\n- 'in': The regex pattern to match, without the leading and trailing slashes and flags. Should be a valid ECMAScript regex.\n- 'out': The replacement text for the matches. It can use $1, $2, or $<name> (for named capture groups) to refer to the captured groups.\n  - Note: It can accept Markdown and HTML, even <style> tags which will be prepended and deduplicated. One can use regex scripts for decoration with 'editdisplay' type. Same restriction as backgroundEmbedding applies; see below.\n- 'flag': The regex flags to use. Should be valid ECMAScript regex flags, like 'g', 'i', 'm', etc. Multiple flags can also be used like 'gi' or 'gm'.\n- 'ableFlag': A boolean value indicating whether the flag settings are enabled. If false, the script will use default flags of 'g'.\n- 'comment': The name of the script. This is used to identify the script in the list.\n\nLorebooks are texts containing various information about the character with conditional activation based on chat history. Fields:\n- 'alwaysActive': A boolean value indicating whether the entry is always active. If true, the entry will be included even if all of its keys are not in the chat history.\n- 'key': The key that will activate this lorebook. Multiple keys can be specified separated by commas. If one of the keys is in the chat history, the entry will be included in the next prompt.\n- 'content': The content of the entry.\n- 'name': The name of the lorebook. Used for identifying the entry in the list.\n\nbackgroundEmbedding is an HTML string mainly for custom styling. It can, and mostly include <style> tags with CSS. Note that all selectors will be prefixed with '.chattext ' so they cannot escape the chat boundary - No html, body, :root access.\n", this.handlers = [
			new c(),
			new l(),
			new d()
		];
	}
	async getToolList() {
		let e = [];
		for (let t of this.handlers) e = e.concat(t.getTools());
		return e;
	}
	async callTool(e, t) {
		try {
			for (let n of this.handlers) {
				let r = await n.handle(e, t);
				if (r) return r;
			}
		} catch (e) {
			return [{
				type: "text",
				text: `Error: ${e.message}`
			}];
		}
		return [{
			type: "text",
			text: `Tool ${e} not found.`
		}];
	}
};
//#endregion
export { f as RisuAccessClient };
