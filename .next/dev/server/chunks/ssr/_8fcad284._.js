module.exports = [
"[project]/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
    "getTopAnime",
    ()=>getTopAnime,
    "searchAnime",
    ()=>searchAnime
]);
const JIKAN_API_BASE = 'https://api.jikan.moe/v4';
// ==========================================
// 2. HELPER FUNCTIONS (RETRY LOGIC)
// ==========================================
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
/**
 * Fungsi Fetch Pintar dengan Auto-Retry dan Exponential Backoff 
 * untuk menangani Rate Limit Jikan API (429).
 */ async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
    try {
        // Delay kecil global untuk menghindari rate limit agresif Jikan
        await delay(300);
        const res = await fetch(url, options);
        // Jika terkena Rate Limit (429), retry
        if (res.status === 429 && retries > 0) {
            console.warn(`[API] Rate limit hit for ${url}. Retrying in ${backoff}ms...`);
            await delay(backoff);
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        return res;
    } catch (error) {
        // Retry pada error jaringan
        if (retries > 0) {
            await delay(backoff);
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
    }
}
async function getAnimeDetail(mal_id) {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/anime/${mal_id}/full`, {
            next: {
                revalidate: 3600
            }
        });
        if (res.status === 404) return null;
        if (!res.ok) return null;
        const data = await res.json();
        return data.data;
    } catch (error) {
        return null;
    }
}
async function getAnimeCharacters(mal_id) {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/anime/${mal_id}/characters`, {
            next: {
                revalidate: 3600
            }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data.sort((a, b)=>a.role === 'Main' ? -1 : 1).slice(0, 12);
    } catch (error) {
        return [];
    }
}
async function getAnimeReviews(mal_id) {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/anime/${mal_id}/reviews?preliminary=true&spoiler=false`, {
            next: {
                revalidate: 3600
            }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data.slice(0, 6);
    } catch (error) {
        return [];
    }
}
async function getAnimeStatistics(mal_id) {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/anime/${mal_id}/statistics`, {
            next: {
                revalidate: 3600
            }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.data;
    } catch (error) {
        return null;
    }
}
async function getMangaDetail(mal_id) {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/manga/${mal_id}/full`, {
            next: {
                revalidate: 3600
            }
        });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        return data.data;
    } catch (error) {
        return null;
    }
}
async function getTopAnime() {
    try {
        const [res1, res2] = await Promise.all([
            fetchWithRetry(`${JIKAN_API_BASE}/top/anime?page=1&limit=25`, {
                next: {
                    revalidate: 3600
                }
            }),
            fetchWithRetry(`${JIKAN_API_BASE}/top/anime?page=2&limit=25`, {
                next: {
                    revalidate: 3600
                }
            })
        ]);
        if (!res1.ok || !res2.ok) throw new Error('Failed');
        const data1 = await res1.json();
        const data2 = await res2.json();
        return {
            data: [
                ...data1.data,
                ...data2.data
            ],
            pagination: data1.pagination
        };
    } catch (error) {
        return {
            data: []
        };
    }
}
async function getPopularAnime() {
    try {
        const [res1, res2] = await Promise.all([
            fetchWithRetry(`${JIKAN_API_BASE}/top/anime?filter=bypopularity&page=1&limit=25`, {
                next: {
                    revalidate: 3600
                }
            }),
            fetchWithRetry(`${JIKAN_API_BASE}/top/anime?filter=bypopularity&page=2&limit=25`, {
                next: {
                    revalidate: 3600
                }
            })
        ]);
        if (!res1.ok || !res2.ok) throw new Error('Failed');
        const data1 = await res1.json();
        const data2 = await res2.json();
        return {
            data: [
                ...data1.data,
                ...data2.data
            ],
            pagination: data1.pagination
        };
    } catch (error) {
        return {
            data: []
        };
    }
}
async function getSeasonNow(page = 1) {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/seasons/now?page=${page}&limit=25`, {
            next: {
                revalidate: 86400
            }
        });
        if (!res.ok) throw new Error('Failed');
        return await res.json();
    } catch (error) {
        return {
            data: []
        };
    }
}
async function searchAnime(query, page = 1, signal) {
    try {
        const url = `${JIKAN_API_BASE}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=25&sfw=true`;
        // Pass signal ke fetchWithRetry agar request bisa di-cancel
        const res = await fetchWithRetry(url, {
            signal,
            next: {
                revalidate: 300
            }
        });
        if (!res.ok) return {
            data: []
        };
        return await res.json();
    } catch (error) {
        return {
            data: []
        };
    }
}
async function getGenres() {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/genres/anime`, {
            next: {
                revalidate: 86400
            }
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        return data.data;
    } catch (error) {
        return [];
    }
}
async function getAnimeByGenre(genreId) {
    try {
        const pages = [
            1,
            2,
            3,
            4,
            5
        ];
        const promises = pages.map((page)=>fetchWithRetry(`${JIKAN_API_BASE}/anime?genres=${genreId}&page=${page}&limit=25&order_by=start_date&sort=desc&sfw=true`, {
                next: {
                    revalidate: 3600
                }
            }).then((res)=>res.ok ? res.json() : {
                    data: []
                }));
        const results = await Promise.all(promises);
        const combinedData = results.flatMap((r)=>r.data || []);
        const uniqueData = Array.from(new Map(combinedData.map((item)=>[
                item.mal_id,
                item
            ])).values());
        return {
            data: uniqueData,
            pagination: {
                last_visible_page: 5,
                has_next_page: true,
                current_page: 1
            }
        };
    } catch (error) {
        return {
            data: []
        };
    }
}
}),
"[project]/components/anime-card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnimeCard",
    ()=>AnimeCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-ssr] (ecmascript) <export default as Star>");
"use client";
;
;
function AnimeCard({ anime }) {
    const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "https://placehold.co/300x450/333333/FFFFFF?text=No+Image";
    const displayScore = anime.score != null ? anime.score.toFixed(1) : "N/A";
    const displayEpisodes = anime.episodes != null ? `${anime.episodes} Ep` : "Ongoing";
    const displayType = anime.type || "Anime";
    // Label yang muncul di kiri atas
    const typeLabel = displayType.toLowerCase() === "movie" ? "Movie" : displayType.toLowerCase() === "tv" ? "TV Anime" : displayType;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "group relative flex flex-col h-full cursor-pointer rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-full aspect-[2/3] overflow-hidden rounded-t-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: imageUrl,
                        alt: anime.title,
                        className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
                        loading: "lazy",
                        onError: (e)=>e.target.src = "https://placehold.co/300x450/333333/FFFFFF?text=No+Image"
                    }, void 0, false, {
                        fileName: "[project]/components/anime-card.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    }, void 0, false, {
                        fileName: "[project]/components/anime-card.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-2 left-2 bg-black/70 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm z-10",
                        children: typeLabel
                    }, void 0, false, {
                        fileName: "[project]/components/anime-card.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this),
                    anime.score != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-2 right-2 bg-black/70 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm z-10 flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                size: 12,
                                className: "text-yellow-400 fill-yellow-400"
                            }, void 0, false, {
                                fileName: "[project]/components/anime-card.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this),
                            displayScore
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/anime-card.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/anime-card.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3 flex flex-col flex-1 bg-card border-t border-border/50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold text-sm sm:text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors mb-1",
                        children: anime.title
                    }, void 0, false, {
                        fileName: "[project]/components/anime-card.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-auto flex items-center justify-between text-xs text-muted-foreground pt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: displayEpisodes
                            }, void 0, false, {
                                fileName: "[project]/components/anime-card.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium bg-muted px-2 py-0.5 rounded-full text-foreground/80",
                                children: typeLabel
                            }, void 0, false, {
                                fileName: "[project]/components/anime-card.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/anime-card.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/anime-card.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/anime-card.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/popular/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PopularPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$anime$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/anime-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
'use client';
;
;
;
;
;
;
// Placeholder Component untuk Navbar (Sederhana)
const Navbar = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto flex h-full items-center px-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-bold text-xl",
                children: "FeinimeList"
            }, void 0, false, {
                fileName: "[project]/app/popular/page.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/app/popular/page.tsx",
            lineNumber: 12,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/app/popular/page.tsx",
        lineNumber: 11,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
// Placeholder Component untuk SkeletonGrid (Sederhana)
const SkeletonGrid = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6",
        children: [
            ...Array(10)
        ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "aspect-[2/3] w-full rounded-xl bg-muted/50 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/app/popular/page.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-4 w-3/4 rounded bg-muted/50 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/app/popular/page.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-3 w-1/2 rounded bg-muted/50 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/app/popular/page.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, i, true, {
                fileName: "[project]/app/popular/page.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)))
    }, void 0, false, {
        fileName: "[project]/app/popular/page.tsx",
        lineNumber: 20,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
function PopularPage() {
    const [animes, setAnimes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchPopular = async ()=>{
            setLoading(true);
            try {
                const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPopularAnime"])();
                setAnimes(data.data || []);
            } catch (error) {
                console.error("Gagal mengambil anime populer:", error);
            } finally{
                setLoading(false);
            }
        };
        fetchPopular();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-background",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Navbar, {}, void 0, false, {
                fileName: "[project]/app/popular/page.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center md:text-left mb-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-4xl font-bold mb-2 text-foreground",
                                children: "Popular Anime"
                            }, void 0, false, {
                                fileName: "[project]/app/popular/page.tsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-muted-foreground",
                                children: "Jelajahi seri anime paling populer saat ini"
                            }, void 0, false, {
                                fileName: "[project]/app/popular/page.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/popular/page.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SkeletonGrid, {}, void 0, false, {
                        fileName: "[project]/app/popular/page.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this) : animes.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                        children: animes.map((anime, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: `/anime/${anime.mal_id}`,
                                className: "group relative block",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$anime$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimeCard"], {
                                        anime: anime
                                    }, void 0, false, {
                                        fileName: "[project]/app/popular/page.tsx",
                                        lineNumber: 74,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 rounded-xl pointer-events-none z-10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-flex h-10 items-center justify-center rounded-md border border-white/30 bg-white/20 backdrop-blur-md px-6 text-sm font-bold text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                    size: 18,
                                                    className: "mr-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/popular/page.tsx",
                                                    lineNumber: 79,
                                                    columnNumber: 21
                                                }, this),
                                                " Lihat Detail"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/popular/page.tsx",
                                            lineNumber: 78,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/popular/page.tsx",
                                        lineNumber: 77,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, `${anime.mal_id}-${index}`, true, {
                                fileName: "[project]/app/popular/page.tsx",
                                lineNumber: 67,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/popular/page.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground",
                            children: "Tidak ditemukan anime populer"
                        }, void 0, false, {
                            fileName: "[project]/app/popular/page.tsx",
                            lineNumber: 88,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/popular/page.tsx",
                        lineNumber: 87,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/popular/page.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "border-t border-border bg-card mt-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col md:flex-row justify-between items-center gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center md:text-left",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold text-xl tracking-tight",
                                        children: "FeinimeList"
                                    }, void 0, false, {
                                        fileName: "[project]/app/popular/page.tsx",
                                        lineNumber: 100,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/popular/page.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                    className: "flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground",
                                    children: [
                                        'Home',
                                        'Popular',
                                        'Trending',
                                        'About',
                                        'Contact',
                                        'FAQ'
                                    ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#",
                                            className: "hover:text-primary transition-colors",
                                            children: item
                                        }, item, false, {
                                            fileName: "[project]/app/popular/page.tsx",
                                            lineNumber: 106,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/popular/page.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#",
                                            className: "text-muted-foreground hover:text-[#1DA1F2] transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "sr-only",
                                                    children: "Twitter"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/popular/page.tsx",
                                                    lineNumber: 115,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "w-5 h-5",
                                                    viewBox: "0 0 24 24",
                                                    fill: "currentColor",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.955-2.178-1.55-3.594-1.55-2.717 0-4.92 2.204-4.92 4.917 0 .39.045.765.127 1.124-4.087-.205-7.72-2.164-10.148-5.144-.424.722-.666 1.561-.666 2.475 0 1.708.87 3.214 2.188 4.099-.807-.025-1.566-.248-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.604 3.416-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.779-.023-1.158-.067 2.189 1.402 4.768 2.217 7.548 2.217 9.051 0 14-7.496 14-13.986 0-.21 0-.42-.015-.63 1.009-.73 1.884-1.64 2.584-2.675z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/popular/page.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/popular/page.tsx",
                                                    lineNumber: 116,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/popular/page.tsx",
                                            lineNumber: 114,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#",
                                            className: "text-muted-foreground hover:text-[#5865F2] transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "sr-only",
                                                    children: "Discord"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/popular/page.tsx",
                                                    lineNumber: 122,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "w-5 h-5",
                                                    viewBox: "0 0 71 55",
                                                    fill: "currentColor",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M60.1 4.55A59 59 0 0 0 46.92 0c-.65 1.14-1.39 2.59-1.9 3.74a42 42 0 0 0-17 0C27.5 2.6 26.76 1.15 26.1 0A58.8 58.8 0 0 0 10.9 4.55C2.68 19.28.08 33.43 1.3 47.36c11.04 8.16 21.56 6.06 21.56 6.06 1.44-1.84 2.56-3.78 3.44-5.7-6.16-1.84-8.52-4.52-8.52-4.52.72.48 1.44.92 2.16 1.3 4.92 2.52 10.12 3.78 15.44 3.78s10.52-1.26 15.44-3.78c.72-.38 1.44-.82 2.16-1.3 0 0-2.36 2.68-8.52 4.52.88 1.92 2 3.86 3.44 5.7 0 0 10.52 2.1 21.56-6.06 1.22-13.92-1.38-28.07-9.6-42.8Z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/popular/page.tsx",
                                                        lineNumber: 124,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/popular/page.tsx",
                                                    lineNumber: 123,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/popular/page.tsx",
                                            lineNumber: 121,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/popular/page.tsx",
                                    lineNumber: 113,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/popular/page.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "FeinimeList © 2025. All rights reserved."
                            }, void 0, false, {
                                fileName: "[project]/app/popular/page.tsx",
                                lineNumber: 132,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/popular/page.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/popular/page.tsx",
                    lineNumber: 95,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/popular/page.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/popular/page.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_8fcad284._.js.map