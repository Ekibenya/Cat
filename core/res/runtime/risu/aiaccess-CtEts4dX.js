import { fi as e } from "./characterCards-BhA9VRBa.js";
import { t } from "./internalmcp-BEm-hL3W.js";
//#region src/ts/process/mcp/aiaccess.ts
var n = class extends t {
	directoryHandle = null;
	initialized = !1;
	constructor() {
		super("internal:aiaccess"), this.serverInfo.serverInfo.name = "AI Access Client", this.serverInfo.instructions = "Client for accessing AI services and tools.";
	}
	async getToolList() {
		return [{
			name: "runLLM",
			description: "Run a large language model (LLM) with specified parameters.",
			inputSchema: {
				type: "object",
				properties: {
					model: {
						type: "string",
						description: "The type of the LLM to use. \"normal\" for full model, \"lite\" for a smaller, faster model.",
						enum: ["normal", "lite"]
					},
					messages: {
						type: "array",
						items: {
							type: "object",
							properties: {
								role: {
									type: "string",
									enum: [
										"user",
										"assistant",
										"system"
									],
									description: "The role of the message sender."
								},
								content: {
									type: "string",
									description: "The content of the message."
								}
							},
							required: ["role", "content"]
						},
						description: "Messages to send to the LLM."
					}
				},
				required: ["model", "messages"]
			}
		}];
	}
	async callTool(t, n) {
		if (t === "runLLM") {
			let { model: t, messages: r } = n;
			if (!t || !r || !Array.isArray(r)) return [{
				type: "text",
				text: "Invalid arguments for runLLM. Please provide a valid model and messages."
			}];
			let i = await e({
				formated: r.map((e) => ({
					role: e.role,
					content: e.content
				})),
				bias: {}
			}, t === "lite" ? "otherAx" : "model");
			return [{
				type: "text",
				text: JSON.stringify({
					success: i.type === "success",
					message: i.result
				})
			}];
		}
		return [{
			type: "text",
			text: `Method ${t} not found.`
		}];
	}
};
//#endregion
export { n as AIAccessClient };
