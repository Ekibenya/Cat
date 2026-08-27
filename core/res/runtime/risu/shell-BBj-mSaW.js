//#region node_modules/.pnpm/highlight.js@11.11.1/node_modules/highlight.js/es/languages/shell.js
function e(e) {
	return {
		name: "Shell Session",
		aliases: ["console", "shellsession"],
		contains: [{
			className: "meta.prompt",
			begin: /^\s{0,3}[/~\w\d[\]()@-]*[>%$#][ ]?/,
			starts: {
				end: /[^\\](?=\s*$)/,
				subLanguage: "bash"
			}
		}]
	};
}
//#endregion
export { e as default };
