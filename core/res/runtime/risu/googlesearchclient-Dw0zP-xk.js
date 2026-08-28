import { i as e } from "./chunk-DeC0fbbY.js";
import { t } from "./localforage-KfCc0mTS.js";
import { _ as n, rt as r } from "./characterCards-B-JmSHKq.js";
import { t as i } from "./internalmcp-BEm-hL3W.js";
//#region src/ts/process/mcp/googlesearchclient.ts
var a = /* @__PURE__ */ e(t(), 1), o = class extends i {
	initialized = !1;
	API_KEY = "";
	SEARCH_ENGINE_ID = "";
	credentialsStorage = a.default.createInstance({
		name: "google-search-credentials",
		storeName: "credentials"
	});
	constructor() {
		super("internal:googlesearch"), this.serverInfo.serverInfo.name = "Google Search Client", this.serverInfo.serverInfo.version = "1.0.0", this.serverInfo.instructions = "Provides Google Custom Search functionality using the Google Custom Search REST API to search the web and find images";
	}
	async checkHandshake() {
		return this.initialized ||= (await this.initializeCredentials(), !0), this.serverInfo;
	}
	async initializeCredentials() {
		let e = await this.credentialsStorage.getItem("google-search-creds");
		if (e && e.apiKey && e.searchEngineId) {
			this.API_KEY = e.apiKey, this.SEARCH_ENGINE_ID = e.searchEngineId;
			return;
		}
		let t = await n("Please enter your Google Custom Search API Key:");
		if (!t || t.trim() === "") throw Error("Google Custom Search API Key is required");
		let r = await n("Please enter your Google Custom Search Engine ID:");
		if (!r || r.trim() === "") throw Error("Google Custom Search Engine ID is required");
		let i = {
			apiKey: t.trim(),
			searchEngineId: r.trim()
		};
		await this.credentialsStorage.setItem("google-search-creds", i), this.API_KEY = i.apiKey, this.SEARCH_ENGINE_ID = i.searchEngineId;
	}
	async getToolList() {
		return [{
			name: "google_search",
			description: "Search the web using Google Custom Search API. Returns web page results with titles, links, and snippets.",
			inputSchema: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description: "The search query to execute"
					},
					num: {
						type: "integer",
						description: "Number of search results to return (1-10, default: 10)",
						minimum: 1,
						maximum: 10,
						default: 10
					},
					start: {
						type: "integer",
						description: "The index of the first result to return (default: 1)",
						minimum: 1,
						default: 1
					},
					dateRestrict: {
						type: "string",
						description: "Restrict results to a specific time period (e.g., 'd1' for past day, 'w1' for past week)"
					},
					siteSearch: {
						type: "string",
						description: "Restrict search to a specific site (e.g., 'reddit.com')"
					},
					fileType: {
						type: "string",
						description: "Restrict search to specific file types (e.g., 'pdf', 'doc')"
					},
					language: {
						type: "string",
						description: "Language code for search results (e.g., 'en', 'es')"
					},
					safe: {
						type: "string",
						description: "SafeSearch setting",
						enum: ["active", "off"],
						default: "active"
					}
				},
				required: ["query"]
			}
		}, {
			name: "google_search_images",
			description: "Search for images using Google Custom Search API. Returns image results with thumbnails, dimensions, and context.",
			inputSchema: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description: "The image search query to execute"
					},
					num: {
						type: "integer",
						description: "Number of image results to return (1-10, default: 10)",
						minimum: 1,
						maximum: 10,
						default: 10
					},
					start: {
						type: "integer",
						description: "The index of the first result to return (default: 1)",
						minimum: 1,
						default: 1
					},
					imageSize: {
						type: "string",
						description: "Size of images to search for",
						enum: [
							"huge",
							"icon",
							"large",
							"medium",
							"small",
							"xlarge",
							"xxlarge"
						]
					},
					imageType: {
						type: "string",
						description: "Type of images to search for",
						enum: [
							"clipart",
							"face",
							"lineart",
							"stock",
							"photo",
							"animated"
						]
					},
					imageColorType: {
						type: "string",
						description: "Color type of images",
						enum: [
							"color",
							"gray",
							"mono",
							"trans"
						]
					},
					safe: {
						type: "string",
						description: "SafeSearch setting",
						enum: ["active", "off"],
						default: "active"
					}
				},
				required: ["query"]
			}
		}];
	}
	async callTool(e, t) {
		try {
			switch (e) {
				case "google_search": return await this.performWebSearch(t);
				case "google_search_images": return await this.performImageSearch(t);
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
	buildSearchUrl(e, t) {
		return `https://customsearch.googleapis.com/customsearch/v1?${new URLSearchParams({
			key: this.API_KEY,
			cx: this.SEARCH_ENGINE_ID,
			q: e.trim(),
			...t
		}).toString()}`;
	}
	async performWebSearch(e) {
		let { query: t, num: n = 10, start: i = 1, dateRestrict: a, siteSearch: o, fileType: s, language: c, safe: l = "active" } = e;
		if (!t || !t.trim()) return [{
			type: "text",
			text: "Search query cannot be empty."
		}];
		if (!this.API_KEY || !this.SEARCH_ENGINE_ID) return [{
			type: "text",
			text: "Google Custom Search API key and Search Engine ID must be configured."
		}];
		try {
			let e = {
				num: n.toString(),
				start: i.toString(),
				safe: l
			};
			a && (e.dateRestrict = a), o && (e.siteSearch = o), s && (e.fileType = s), c && (e.hl = c);
			let u = await r(this.buildSearchUrl(t, e), {
				method: "GET",
				headers: { Accept: "application/json" }
			});
			if (!u.ok) {
				let e = await u.text();
				return [{
					type: "text",
					text: `Search API error (${u.status}): ${e}`
				}];
			}
			let d = await u.json();
			if (!d.items || d.items.length === 0) return [{
				type: "text",
				text: `No search results found for query: "${t}"`
			}];
			let f = d.items.map((e, t) => ({
				position: i + t,
				title: e.title || "No title",
				link: e.link,
				snippet: e.snippet || "No snippet available",
				displayLink: e.displayLink
			})), p = {
				query: t,
				totalResults: d.searchInformation?.totalResults || "unknown",
				searchTime: d.searchInformation?.searchTime || "unknown",
				resultsCount: f.length,
				results: f
			};
			return [{
				type: "text",
				text: JSON.stringify(p, null, 2)
			}];
		} catch (e) {
			return [{
				type: "text",
				text: `Search failed: ${e instanceof Error ? e.message : "Unknown error occurred"}`
			}];
		}
	}
	async performImageSearch(e) {
		let { query: t, num: n = 10, start: i = 1, imageSize: a, imageType: o, imageColorType: s, safe: c = "active" } = e;
		if (!t || !t.trim()) return [{
			type: "text",
			text: "Search query cannot be empty."
		}];
		if (!this.API_KEY || !this.SEARCH_ENGINE_ID) return [{
			type: "text",
			text: "Google Custom Search API key and Search Engine ID must be configured."
		}];
		try {
			let e = {
				num: n.toString(),
				start: i.toString(),
				searchType: "image",
				safe: c
			};
			a && (e.imgSize = a), o && (e.imgType = o), s && (e.imgColorType = s);
			let l = await r(this.buildSearchUrl(t, e), {
				method: "GET",
				headers: { Accept: "application/json" }
			});
			if (!l.ok) {
				let e = await l.text();
				return [{
					type: "text",
					text: `Image search API error (${l.status}): ${e}`
				}];
			}
			let u = await l.json();
			if (!u.items || u.items.length === 0) return [{
				type: "text",
				text: `No image results found for query: "${t}"`
			}];
			let d = u.items.map((e, t) => ({
				position: i + t,
				title: e.title || "No title",
				link: e.link,
				displayLink: e.displayLink,
				thumbnail: e.image?.thumbnailLink,
				contextLink: e.image?.contextLink,
				width: e.image?.width,
				height: e.image?.height,
				size: e.image?.byteSize,
				snippet: e.snippet || "No snippet available"
			})), f = {
				query: t,
				totalResults: u.searchInformation?.totalResults || "unknown",
				searchTime: u.searchInformation?.searchTime || "unknown",
				resultsCount: d.length,
				results: d
			};
			return [{
				type: "text",
				text: JSON.stringify(f, null, 2)
			}];
		} catch (e) {
			return [{
				type: "text",
				text: `Image search failed: ${e instanceof Error ? e.message : "Unknown error occurred"}`
			}];
		}
	}
	destroy() {
		this.initialized = !1, this.API_KEY = "", this.SEARCH_ENGINE_ID = "";
	}
};
//#endregion
export { o as GoogleSearchClient };
