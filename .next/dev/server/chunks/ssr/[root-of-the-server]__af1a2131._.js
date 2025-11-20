module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

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
"[project]/lib/api.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-rsc] (ecmascript)");
;
const API_BASE = 'http://localhost:4000/anime/zoro';
// ============================
// Helper function untuk fetch
// ============================
async function fetchAnime(endpoint, page = 1) {
    try {
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].get(`${API_BASE}/${endpoint}?page=${page}`);
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
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].get(`${API_BASE}/search?query=${encodeURIComponent(query)}&page=${page}`);
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
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].get(`${API_BASE}/info/${animeId}`);
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
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].get(`${API_BASE}/watch/${episodeId}`);
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
"[project]/app/anime/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/anime/[id]/page.tsx
__turbopack_context__.s([
    "default",
    ()=>AnimePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-rsc] (ecmascript)"); // Pastikan path ke api.ts benar
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
;
;
;
// --- Helper Function untuk Type Narrowing ---
// Memastikan error adalah AxiosError dan memiliki properti response
function isAxiosError(error) {
    return error.isAxiosError !== undefined;
}
async function AnimePage({ params }) {
    // PERBAIKAN 1: Menggunakan await pada params untuk mengatasi Promise Error
    const resolvedParams = await params;
    const rawSlug = resolvedParams.id;
    // PERBAIKAN 2: Mengurai ID Numerik (MAL ID) dari slug
    const parts = rawSlug.split('-');
    const malId = parts.pop();
    if (!malId || isNaN(Number(malId))) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    let anime = null;
    try {
        // Panggil API dengan ID numerik (malId)
        anime = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAnimeDetail"])(malId);
    } catch (e) {
        // ✅ PERBAIKAN 3: Menangani 'e is of type unknown' menggunakan type narrowing
        console.error(`Error fetching detail for ID ${malId}:`, e); // Baris 38
        // Cek apakah error adalah AxiosError (yang Anda gunakan untuk cek 404)
        if (isAxiosError(e) && e.response) {
            // Cek status code 404 (Not Found)
            if (e.response.status === 404) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
            }
        }
        // Tangani error lainnya
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "An unexpected error occurred while loading anime details."
        }, void 0, false, {
            fileName: "[project]/app/anime/[id]/page.tsx",
            lineNumber: 53,
            columnNumber: 16
        }, this);
    }
    if (!anime) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    // --- Lanjutkan rendering halaman ---
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "container py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-3xl font-bold",
                children: anime.title
            }, void 0, false, {
                fileName: "[project]/app/anime/[id]/page.tsx",
                lineNumber: 63,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-4",
                children: anime.synopsis
            }, void 0, false, {
                fileName: "[project]/app/anime/[id]/page.tsx",
                lineNumber: 64,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 grid grid-cols-2 md:grid-cols-4 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-semibold",
                                children: "Score:"
                            }, void 0, false, {
                                fileName: "[project]/app/anime/[id]/page.tsx",
                                lineNumber: 68,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: anime.score ?? 'N/A'
                            }, void 0, false, {
                                fileName: "[project]/app/anime/[id]/page.tsx",
                                lineNumber: 69,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/anime/[id]/page.tsx",
                        lineNumber: 67,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-semibold",
                                children: "Episodes:"
                            }, void 0, false, {
                                fileName: "[project]/app/anime/[id]/page.tsx",
                                lineNumber: 72,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: anime.episodes ?? 'N/A'
                            }, void 0, false, {
                                fileName: "[project]/app/anime/[id]/page.tsx",
                                lineNumber: 73,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/anime/[id]/page.tsx",
                        lineNumber: 71,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/anime/[id]/page.tsx",
                lineNumber: 66,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/anime/[id]/page.tsx",
        lineNumber: 62,
        columnNumber: 9
    }, this);
}
}),
"[project]/app/anime/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/anime/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__af1a2131._.js.map