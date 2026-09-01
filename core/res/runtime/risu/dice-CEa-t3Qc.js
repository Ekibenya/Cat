import { t as e } from "./internalmcp-DA5Wm260.js";
//#region src/ts/process/mcp/dice.ts
var t = class extends e {
	constructor() {
		super("internal:dice"), this.serverInfo.serverInfo.name = "Dice", this.serverInfo.serverInfo.version = "1.0.0", this.serverInfo.instructions = "A tool to roll dice in various formats. like '2d6+3' or 'd20'.";
	}
	async getToolList() {
		return [{
			name: "rollDice",
			description: "Roll dice based on the given notation.",
			inputSchema: {
				type: "object",
				properties: { notation: {
					type: "string",
					description: "The dice notation to roll, e.g., \"2d6+3\"."
				} },
				required: ["notation"]
			}
		}];
	}
	async callTool(e, t) {
		if (e === "rollDice") {
			let e = t.notation, r = n(e);
			return [{
				type: "text",
				text: `Rolled ${e}: ${r.total} (Details: ${r.details})`
			}];
		}
		throw Error(`Unknown tool: ${e}`);
	}
};
function n(e) {
	let t = /(\d*)d(\d+)([+-]\d+)?/g, n, r = 0, i = [];
	for (; (n = t.exec(e)) !== null;) {
		let e = parseInt(n[1]) || 1, t = parseInt(n[2]), a = n[3] ? parseInt(n[3]) : 0, o = 0, s = [];
		for (let n = 0; n < e; n++) {
			let e = Math.floor(Math.random() * t) + 1;
			s.push(e), o += e;
		}
		o += a, r += o, i.push(`${e}d${t}${a ? n[3] : ""}: [${s.join(", ")}]${a ? ` ${n[3]}` : ""} = ${o}`);
	}
	return {
		total: r,
		details: i.join("; ")
	};
}
//#endregion
export { t as DiceClient };
