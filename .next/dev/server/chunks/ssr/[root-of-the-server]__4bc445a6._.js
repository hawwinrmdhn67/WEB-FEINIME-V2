module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/lib/api.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/api.ts
__turbopack_context__.s([
    "getAnimeByGenre",
    ()=>getAnimeByGenre,
    "getAnimeCharacters",
    ()=>getAnimeCharacters,
    "getAnimeDetail",
    ()=>getAnimeDetail,
    "getAnimeReviews",
    ()=>getAnimeReviews,
    "getAnimeStatistics",
    ()=>getAnimeStatistics,
    "getGenres",
    ()=>getGenres,
    "getMangaDetail",
    ()=>getMangaDetail,
    "getPopularAnime",
    ()=>getPopularAnime,
    "getSeasonNow",
    ()=>getSeasonNow,
    "getSeasonUpcoming",
    ()=>getSeasonUpcoming,
    "getTopAnime",
    ()=>getTopAnime,
    "searchAnime",
    ()=>searchAnime
]);
const JIKAN_API_BASE = 'https://api.jikan.moe/v4';
// =========================
// 2. RATE LIMITER & QUEUE SYSTEM
// =========================
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
/**
 * GLOBAL QUEUE:
 * Variabel ini bertugas menampung Promise chain.
 * FIX: Menggunakan Promise<any> agar kompatibel dengan berbagai return type.
 */ let apiQueue = Promise.resolve();
/**
 * scheduleRequest:
 * Fungsi ini memastikan setiap request ke API Jikan diberi jeda waktu 400ms
 * dan dieksekusi secara berurutan (sequential).
 */ function scheduleRequest(callback) {
    // Tambahkan request baru ke ujung antrian
    const operation = apiQueue.then(async ()=>{
        // Tunggu 400ms SEBELUM melakukan fetch
        await delay(400);
        return callback();
    });
    // Update pointer antrian agar request berikutnya menunggu request ini selesai
    // Kita catch error agar jika satu request gagal, antrian tidak macet
    apiQueue = operation.catch(()=>{});
    return operation;
}
/**
 * fetchWithRetry:
 * Menggunakan scheduleRequest untuk membungkus fetch.
 * Jika masih terkena 429, dia akan melakukan retry dengan backoff.
 */ async function fetchWithRetry(endpoint, options = {}, retries = 3, backoff = 1000) {
    const url = endpoint.startsWith('http') ? endpoint : `${JIKAN_API_BASE}${endpoint}`;
    try {
        // PENTING: Gunakan scheduleRequest, jangan langsung fetch
        const res = await scheduleRequest(()=>fetch(url, options));
        // Jika masih terkena limit (kasus sangat jarang dengan queue), lakukan retry manual
        if (res.status === 429) {
            if (retries > 0) {
                console.warn(`[API 429] Rate limit hit for ${url}, queueing retry in ${backoff}ms...`);
                await delay(backoff);
                return fetchWithRetry(endpoint, options, retries - 1, backoff * 2);
            } else {
                console.error(`[API Fail] Max retries reached for ${url}`);
                return null;
            }
        }
        if (!res.ok) {
            return null;
        }
        return await res.json();
    } catch (err) {
        if (retries > 0) {
            await delay(backoff);
            return fetchWithRetry(endpoint, options, retries - 1, backoff * 2);
        }
        console.error(`[API Error] ${err}`);
        return null;
    }
}
/**
 * Helper untuk membangun URL dengan Query Params
 */ function buildUrl(path, params) {
    const url = new URL(`${JIKAN_API_BASE}${path}`);
    Object.entries(params).forEach(([key, value])=>{
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });
    return url.toString();
}
/**
 * fetchAnimeList:
 * Mengambil list anime dengan dukungan pagination otomatis melalui Queue System.
 */ async function fetchAnimeList(path, params, pages = 1, revalidate = 3600) {
    try {
        if (pages === 1) {
            const url = buildUrl(path, params);
            const data = await fetchWithRetry(url, {
                next: {
                    revalidate
                }
            });
            return data || {
                data: []
            };
        }
        // Buat array promise untuk setiap halaman
        const promises = [];
        for(let i = 1; i <= pages; i++){
            const url = buildUrl(path, {
                ...params,
                page: i
            });
            promises.push(fetchWithRetry(url, {
                next: {
                    revalidate
                }
            }));
        }
        // Jalankan (scheduleRequest akan membuatnya sequential otomatis)
        const results = await Promise.all(promises);
        const allData = results.flatMap((r)=>r?.data || []);
        const lastResult = results.findLast((r)=>r?.pagination);
        return {
            data: allData,
            pagination: lastResult?.pagination
        };
    } catch (error) {
        console.error('Fetch list error:', error);
        return {
            data: []
        };
    }
}
async function getAnimeDetail(mal_id) {
    const res = await fetchWithRetry(`/anime/${mal_id}/full`, {
        next: {
            revalidate: 3600
        }
    });
    return res?.data || null;
}
async function getAnimeCharacters(mal_id) {
    const res = await fetchWithRetry(`/anime/${mal_id}/characters`, {
        next: {
            revalidate: 3600
        }
    });
    if (!res?.data) return [];
    return res.data.sort((a, b)=>a.role === 'Main' ? -1 : 1).slice(0, 12);
}
async function getAnimeReviews(mal_id) {
    const res = await fetchWithRetry(`/anime/${mal_id}/reviews?preliminary=true&spoiler=false`, {
        next: {
            revalidate: 3600
        }
    });
    return res?.data ? res.data.slice(0, 6) : [];
}
async function getAnimeStatistics(mal_id) {
    const res = await fetchWithRetry(`/anime/${mal_id}/statistics`, {
        next: {
            revalidate: 3600
        }
    });
    return res?.data || null;
}
async function getMangaDetail(mal_id) {
    const res = await fetchWithRetry(`/manga/${mal_id}/full`, {
        next: {
            revalidate: 3600
        }
    });
    return res?.data || null;
}
async function getTopAnime() {
    return fetchAnimeList('/top/anime', {
        limit: 25
    }, 2);
}
async function getPopularAnime() {
    return fetchAnimeList('/top/anime', {
        filter: 'bypopularity',
        limit: 25
    }, 2);
}
async function getSeasonNow() {
    const res = await fetchAnimeList('/seasons/now', {
        limit: 25
    }, 2, 86400);
    if (!res || !Array.isArray(res.data)) {
        return {
            data: []
        };
    }
    return res;
}
async function getSeasonUpcoming() {
    return fetchAnimeList('/seasons/upcoming', {
        limit: 25
    }, 2, 86400);
}
async function searchAnime(query, page = 1, signal) {
    const url = buildUrl('/anime', {
        q: query,
        page,
        limit: 25,
        sfw: true
    });
    const res = await fetchWithRetry(url, {
        next: {
            revalidate: 300
        }
    });
    return res || {
        data: []
    };
}
async function getGenres() {
    const res = await fetchWithRetry('/genres/anime', {
        next: {
            revalidate: 86400
        }
    });
    return res?.data || [];
}
async function getAnimeByGenre(genreId) {
    const LIMIT_PAGES = 5;
    try {
        const promises = [];
        // Kita request 5 halaman sekaligus.
        // Berkat scheduleRequest, ini tidak akan ditembak bersamaan.
        for(let page = 1; page <= LIMIT_PAGES; page++){
            const url = buildUrl('/anime', {
                genres: genreId,
                page: page,
                limit: 25,
                order_by: 'start_date',
                sort: 'desc',
                sfw: true
            });
            promises.push(fetchWithRetry(url, {
                next: {
                    revalidate: 3600
                }
            }));
        }
        const results = await Promise.all(promises);
        const combinedData = results.flatMap((r)=>r?.data || []);
        // Dedup: Hilangkan duplikat
        const uniqueMap = new Map();
        combinedData.forEach((item)=>{
            if (!uniqueMap.has(item.mal_id)) {
                uniqueMap.set(item.mal_id, item);
            }
        });
        const uniqueData = Array.from(uniqueMap.values());
        return {
            data: uniqueData,
            pagination: {
                last_visible_page: LIMIT_PAGES,
                has_next_page: true,
                current_page: 1
            }
        };
    } catch (e) {
        console.error("Error fetching genre:", e);
        return {
            data: []
        };
    }
}
}),
"[project]/components/navbar.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "Navbar",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Navbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Navbar() from the server but Navbar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/navbar.tsx <module evaluation>", "Navbar");
}),
"[project]/components/navbar.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "Navbar",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Navbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Navbar() from the server but Navbar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/navbar.tsx", "Navbar");
}),
"[project]/components/navbar.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$navbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/navbar.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$navbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/navbar.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$navbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/components/anime-action-buttons.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/anime-action-buttons.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/anime-action-buttons.tsx <module evaluation>", "default");
}),
"[project]/components/anime-action-buttons.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/anime-action-buttons.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/anime-action-buttons.tsx", "default");
}),
"[project]/components/anime-action-buttons.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$anime$2d$action$2d$buttons$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/anime-action-buttons.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$anime$2d$action$2d$buttons$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/anime-action-buttons.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$anime$2d$action$2d$buttons$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/anime/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/app/anime/[id]/page.tsx'\n\nExpected ',', got '-'");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/app/anime/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/anime/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4bc445a6._.js.map