//#region src/ts/process/mcp/internalmcp.ts
var e = class {
	url;
	serverInfo;
	constructor(e) {
		this.url = e, this.serverInfo = {
			protocolVersion: "2025-03-26",
			capabilities: { tools: {} },
			serverInfo: {
				name: "Internal Tool",
				version: "1.0.0"
			}
		};
	}
	async checkHandshake() {
		return this.serverInfo;
	}
	async getToolList() {
		return [];
	}
	async callTool(e, t) {
		return [{
			type: "text",
			text: `Tool ${e} not implemented`
		}];
	}
	destroy() {}
};
//#endregion
export { e as t };
