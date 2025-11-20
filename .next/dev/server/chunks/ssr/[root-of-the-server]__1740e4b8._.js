module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/Stream4nzu/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Stream4nzu/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Stream4nzu/lib/rate-limit.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Simple rate limiter for API requests
__turbopack_context__.s([
    "rateLimit",
    ()=>rateLimit
]);
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 250 // 250ms between requests (respects 60 req/min limit)
;
async function rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const delayNeeded = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        await new Promise((resolve)=>setTimeout(resolve, delayNeeded));
    }
    lastRequestTime = Date.now();
}
}),
"[project]/Stream4nzu/lib/api.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// API utilities for anime data fetching using Jikan API
__turbopack_context__.s([
    "getAnimeByGenre",
    ()=>getAnimeByGenre,
    "getAnimeDetail",
    ()=>getAnimeDetail,
    "getGenres",
    ()=>getGenres,
    "getPopularAnime",
    ()=>getPopularAnime,
    "getTopAnime",
    ()=>getTopAnime,
    "searchAnime",
    ()=>searchAnime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/lib/rate-limit.ts [app-rsc] (ecmascript)");
const JIKAN_API_BASE = 'https://api.jikan.moe/v4';
;
async function getTopAnime(page = 1) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rateLimit"])();
        const response = await fetch(`${JIKAN_API_BASE}/top/anime?page=${page}&limit=25&type=tv,movie&filter=airing`, {
            next: {
                revalidate: 3600
            }
        });
        if (!response.ok) throw new Error('Failed to fetch top anime');
        return response.json();
    } catch (error) {
        console.error('Error fetching top anime:', error);
        return {
            data: []
        };
    }
}
async function getPopularAnime(page = 1) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rateLimit"])();
        const response = await fetch(`${JIKAN_API_BASE}/anime?order_by=popularity&sort=asc&page=${page}&limit=25`, {
            next: {
                revalidate: 3600
            }
        });
        if (!response.ok) throw new Error('Failed to fetch popular anime');
        return response.json();
    } catch (error) {
        console.error('Error fetching popular anime:', error);
        return {
            data: []
        };
    }
}
async function getAnimeByGenre(genreId, page = 1) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rateLimit"])();
        const response = await fetch(`${JIKAN_API_BASE}/anime?genres=${genreId}&page=${page}&limit=25`, {
            next: {
                revalidate: 3600
            }
        });
        if (!response.ok) throw new Error('Failed to fetch anime by genre');
        return response.json();
    } catch (error) {
        console.error('Error fetching anime by genre:', error);
        return {
            data: []
        };
    }
}
async function searchAnime(query, page = 1) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rateLimit"])();
        const response = await fetch(`${JIKAN_API_BASE}/anime?query=${encodeURIComponent(query)}&page=${page}&limit=25`, {
            next: {
                revalidate: 3600
            }
        });
        if (!response.ok) throw new Error('Failed to search anime');
        return response.json();
    } catch (error) {
        console.error('Error searching anime:', error);
        return {
            data: []
        };
    }
}
async function getAnimeDetail(mal_id) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rateLimit"])();
        const response = await fetch(`${JIKAN_API_BASE}/anime/${mal_id}`, {
            next: {
                revalidate: 3600
            }
        });
        if (!response.ok) throw new Error('Failed to fetch anime detail');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching anime detail:', error);
        return null;
    }
}
async function getGenres() {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rateLimit"])();
        const response = await fetch(`${JIKAN_API_BASE}/genres/anime`, {
            next: {
                revalidate: 86400
            }
        });
        if (!response.ok) throw new Error('Failed to fetch genres');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching genres:', error);
        return [];
    }
}
}),
"[project]/Stream4nzu/components/navbar.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "Navbar",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Navbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Navbar() from the server but Navbar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Stream4nzu/components/navbar.tsx <module evaluation>", "Navbar");
}),
"[project]/Stream4nzu/components/navbar.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "Navbar",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Navbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Navbar() from the server but Navbar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Stream4nzu/components/navbar.tsx", "Navbar");
}),
"[project]/Stream4nzu/components/navbar.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$navbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Stream4nzu/components/navbar.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$navbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Stream4nzu/components/navbar.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$navbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Stream4nzu/components/anime-grid.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "AnimeGrid",
    ()=>AnimeGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AnimeGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AnimeGrid() from the server but AnimeGrid is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Stream4nzu/components/anime-grid.tsx <module evaluation>", "AnimeGrid");
}),
"[project]/Stream4nzu/components/anime-grid.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "AnimeGrid",
    ()=>AnimeGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AnimeGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AnimeGrid() from the server but AnimeGrid is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Stream4nzu/components/anime-grid.tsx", "AnimeGrid");
}),
"[project]/Stream4nzu/components/anime-grid.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$anime$2d$grid$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Stream4nzu/components/anime-grid.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$anime$2d$grid$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Stream4nzu/components/anime-grid.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$anime$2d$grid$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Stream4nzu/components/skeleton-loader.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SkeletonAnimeCard",
    ()=>SkeletonAnimeCard,
    "SkeletonCarousel",
    ()=>SkeletonCarousel,
    "SkeletonGrid",
    ()=>SkeletonGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function SkeletonAnimeCard() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-96 bg-muted rounded-lg animate-pulse"
            }, void 0, false, {
                fileName: "[project]/Stream4nzu/components/skeleton-loader.tsx",
                lineNumber: 4,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-4 bg-muted rounded w-3/4 animate-pulse"
            }, void 0, false, {
                fileName: "[project]/Stream4nzu/components/skeleton-loader.tsx",
                lineNumber: 5,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-3 bg-muted rounded w-1/2 animate-pulse"
            }, void 0, false, {
                fileName: "[project]/Stream4nzu/components/skeleton-loader.tsx",
                lineNumber: 6,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Stream4nzu/components/skeleton-loader.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
function SkeletonGrid() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6",
        children: Array(20).fill(0).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(SkeletonAnimeCard, {}, i, false, {
                fileName: "[project]/Stream4nzu/components/skeleton-loader.tsx",
                lineNumber: 17,
                columnNumber: 11
            }, this))
    }, void 0, false, {
        fileName: "[project]/Stream4nzu/components/skeleton-loader.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
function SkeletonCarousel() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative h-96 md:h-screen w-full bg-muted rounded-lg animate-pulse"
    }, void 0, false, {
        fileName: "[project]/Stream4nzu/components/skeleton-loader.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
"[project]/Stream4nzu/app/popular/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PopularPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/lib/api.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$navbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/components/navbar.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$anime$2d$grid$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/components/anime-grid.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$skeleton$2d$loader$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Stream4nzu/components/skeleton-loader.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function PopularContent() {
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPopularAnime"])(1);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$anime$2d$grid$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AnimeGrid"], {
        animes: data.data,
        title: "Popular Anime"
    }, void 0, false, {
        fileName: "[project]/Stream4nzu/app/popular/page.tsx",
        lineNumber: 9,
        columnNumber: 10
    }, this);
}
function PopularPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-background",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$navbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Navbar"], {}, void 0, false, {
                fileName: "[project]/Stream4nzu/app/popular/page.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl font-bold mb-2 text-foreground",
                        children: "Popular Anime"
                    }, void 0, false, {
                        fileName: "[project]/Stream4nzu/app/popular/page.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground mb-8",
                        children: "Explore the most popular anime series right now"
                    }, void 0, false, {
                        fileName: "[project]/Stream4nzu/app/popular/page.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Stream4nzu/app/popular/page.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$components$2f$skeleton$2d$loader$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SkeletonGrid"], {}, void 0, false, {
                    fileName: "[project]/Stream4nzu/app/popular/page.tsx",
                    lineNumber: 26,
                    columnNumber: 27
                }, void 0),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Stream4nzu$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(PopularContent, {}, void 0, false, {
                    fileName: "[project]/Stream4nzu/app/popular/page.tsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Stream4nzu/app/popular/page.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Stream4nzu/app/popular/page.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
}),
"[project]/Stream4nzu/app/popular/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Stream4nzu/app/popular/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1740e4b8._.js.map