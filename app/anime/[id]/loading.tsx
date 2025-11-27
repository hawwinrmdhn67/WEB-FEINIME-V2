import { Navbar } from '@/components/navbar'

export default function LoadingAnimePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden animate-pulse">

      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* HERO SKELETON */}
      <div className="relative h-112 md:h-128 w-full overflow-hidden">
        <div className="w-full h-full bg-muted dark:bg-muted/50 blur-sm opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* HEADER SECTION */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 
                      -mt-32 md:-mt-48 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">

        {/* POSTER */}
        <div className="relative w-full max-w-[240px] mx-auto md:mx-0 aspect-[2/3]">
          <div className="w-full h-full bg-muted rounded-xl shadow-2xl" />
        </div>

        {/* TITLE + INFO */}
        <div className="md:col-span-2 flex flex-col justify-end gap-4">
          <div className="space-y-3">
            <div className="h-10 w-3/4 bg-muted rounded-lg" />
            <div className="h-5 w-1/2 bg-muted rounded-lg" />
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card/80 p-4 rounded-lg shadow">
                <div className="h-4 w-20 bg-muted rounded mb-2" />
                <div className="h-6 w-14 bg-muted rounded" />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <div className="w-32 h-10 bg-muted rounded-lg" />
            <div className="w-32 h-10 bg-muted rounded-lg" />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="relative max-w-6xl mx-auto mt-4 space-y-12 pb-20">

        {/* GENRES */}
        <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2">
          <div className="h-8 w-24 bg-muted rounded-full" />
          <div className="h-8 w-20 bg-muted rounded-full" />
          <div className="h-8 w-28 bg-muted rounded-full" />
        </div>

        {/* SYNOPSIS */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-40 bg-muted rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
          </div>
        </section>

        {/* AIRING DETAILS */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-40 bg-muted rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card/50 p-6 rounded-xl">
            {[1, 2, 3].map((_) => (
              <div key={_} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="space-y-1">
                  <div className="w-24 h-3 bg-muted rounded" />
                  <div className="w-28 h-4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATISTICS */}
        <section className="px-4 sm:px-6 lg:px-8">
          <h2 className="h-8 w-40 bg-muted rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card p-5 rounded-xl flex flex-col items-center text-center shadow">
                <div className="w-8 h-8 rounded bg-muted mb-2" />
                <div className="w-20 h-3 bg-muted rounded mb-1" />
                <div className="w-16 h-5 bg-muted rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* CHARACTERS */}
        <section className="px-4 sm:px-6 lg:px-8">
          <h2 className="h-8 w-40 bg-muted rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden">
                <div className="aspect-[3/4] w-full bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* REVIEWS (2 Columns — EXACT MATCH) */}
        <section className="px-4 sm:px-6 lg:px-8">
          <h2 className="h-8 w-40 bg-muted rounded mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-5 shadow flex flex-col gap-4">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full" />
                    <div>
                      <div className="h-4 w-28 bg-muted rounded mb-1" />
                      <div className="h-3 w-20 bg-muted rounded" />
                    </div>
                  </div>

                  <div className="w-10 h-7 bg-muted rounded-md" />
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-11/12 bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                </div>

                {/* Read Full Review */}
                <div className="h-5 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* RELATED CONTENT (exact grouping layout) */}
        <section className="px-4 sm:px-6 lg:px-8">
          <h2 className="h-8 w-40 bg-muted rounded mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 space-y-4">

                {/* Category title */}
                <div className="h-4 w-24 bg-muted rounded" />

                {/* Items */}
                {Array.from({ length: 2 }).map((__, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-muted rounded-full" />
                      <div className="h-4 w-28 bg-muted rounded" />
                    </div>
                    <div className="w-8 h-5 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER SKELETON */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 animate-pulse">

            {/* Brand */}
            <div className="col-span-2 lg:col-span-2 space-y-4">
              <div className="w-10 h-10 bg-muted rounded-xl" />
              <div className="w-32 h-5 bg-muted rounded" />
              <div className="w-56 h-4 bg-muted rounded" />
              <div className="w-44 h-4 bg-muted rounded" />

              {/* Social icons */}
              <div className="flex gap-3 pt-1">
                <div className="w-6 h-6 bg-muted rounded-lg" />
                <div className="w-6 h-6 bg-muted rounded-lg" />
                <div className="w-6 h-6 bg-muted rounded-lg" />
              </div>
            </div>

            {/* Column skeleton generator */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="w-24 h-5 bg-muted rounded" />
                <div className="space-y-2">
                  <div className="w-20 h-4 bg-muted rounded" />
                  <div className="w-24 h-4 bg-muted rounded" />
                  <div className="w-16 h-4 bg-muted rounded" />
                  <div className="w-28 h-4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom footer */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-40 h-4 bg-muted rounded" />
            <div className="w-40 h-4 bg-muted rounded" />
          </div>

        </div>
      </footer>
    </main>
  )
}
