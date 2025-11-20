module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/lib/api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/api.ts
__turbopack_context__.s([
    "API_BASE",
    ()=>API_BASE,
    "getAnimeDetail",
    ()=>getAnimeDetail,
    "getEpisodeStreamingLinks",
    ()=>getEpisodeStreamingLinks,
    "getPopularAnime",
    ()=>getPopularAnime,
    "getRecentEpisodes",
    ()=>getRecentEpisodes,
    "getTopAnime",
    ()=>getTopAnime,
    "searchAnime",
    ()=>searchAnime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-route] (ecmascript)");
;
const API_BASE = 'http://localhost:4000/anime/zoro';
// ============================
// Helper function untuk fetch
// ============================
async function fetchAnime(endpoint, page = 1) {
    try {
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].get(`${API_BASE}/${endpoint}?page=${page}`);
        const data = res.data?.results || [];
        return data.map((item)=>({
                animeId: item.id,
                title: item.title,
                image: item.image,
                url: item.url,
                type: item.type,
                episodes: item.episodes,
                duration: item.duration,
                sub: item.sub,
                dub: item.dub,
                japaneseTitle: item.japaneseTitle,
                nsfw: item.nsfw
            }));
    } catch (err) {
        console.error(`Error in fetchAnime(${endpoint}):`, err);
        return [];
    }
}
async function getRecentEpisodes(page = 1) {
    return fetchAnime('recent-episodes', page);
}
async function getPopularAnime(page = 1) {
    return fetchAnime('popular', page);
}
async function getTopAnime(page = 1) {
    return fetchAnime('top', page);
}
async function searchAnime(query, page = 1) {
    try {
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].get(`${API_BASE}/search?query=${encodeURIComponent(query)}&page=${page}`);
        const data = res.data?.results || [];
        return data.map((item)=>({
                animeId: item.id,
                title: item.title,
                image: item.image,
                url: item.url,
                type: item.type,
                episodes: item.episodes,
                duration: item.duration,
                sub: item.sub,
                dub: item.dub,
                japaneseTitle: item.japaneseTitle,
                nsfw: item.nsfw
            }));
    } catch (err) {
        console.error('Error in searchAnime:', err);
        return [];
    }
}
async function getAnimeDetail(animeId) {
    try {
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].get(`${API_BASE}/info/${animeId}`);
        const item = res.data;
        if (!item) return null;
        // Mapping properti dasar Consumet
        return {
            animeId: item.id,
            title: item.title,
            image: item.image,
            url: item.url,
            type: item.type,
            episodes: item.episodes,
            duration: item.duration,
            sub: item.sub,
            dub: item.dub,
            japaneseTitle: item.japaneseTitle,
            nsfw: item.nsfw,
            // Jika API /info mengembalikan detail tambahan, map di sini:
            title_english: item.title_english,
            synopsis: item.synopsis
        };
    } catch (err) {
        console.error('Error in getAnimeDetail:', err);
        return null;
    }
}
async function getEpisodeStreamingLinks(animeId, episodeId) {
    try {
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].get(`${API_BASE}/watch/${episodeId}`);
        const data = res.data;
        if (!data || data.sources.length === 0) return null;
        return {
            sources: data.sources || [],
            subtitles: data.subtitles || [],
            animeId: animeId,
            episodeId: episodeId
        };
    } catch (err) {
        console.error(`Error fetching streaming links for ${episodeId}:`, err);
        return null;
    }
}
}),
"[project]/lib/searchProxy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAnimeSearch",
    ()=>getAnimeSearch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-route] (ecmascript)");
;
const cache = new Map();
const queue = [];
let processing = false;
const MIN_REQUEST_INTERVAL = 1000 // 1 detik per request
;
async function processQueue() {
    if (processing) return;
    processing = true;
    while(queue.length > 0){
        const { query, resolve, reject } = queue.shift();
        try {
            if (cache.has(query)) resolve(cache.get(query));
            else {
                const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchAnime"])(query);
                cache.set(query, data.data);
                resolve(data.data);
            }
        } catch (err) {
            reject(err);
        }
        await new Promise((r)=>setTimeout(r, MIN_REQUEST_INTERVAL));
    }
    processing = false;
}
function getAnimeSearch(query) {
    return new Promise((resolve, reject)=>{
        queue.push({
            query,
            resolve,
            reject
        });
        processQueue();
    });
}
}),
"[project]/app/api/search/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$searchProxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/searchProxy.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    if (!query) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'Query required'
    }, {
        status: 400
    });
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$searchProxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAnimeSearch"])(query);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data
        });
    } catch (err) {
        console.error('Server proxy search failed:', err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message || 'Failed to search'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b2bea680._.js.map