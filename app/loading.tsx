import { SkeletonLoader } from '@/components/skeleton-loader'

export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">

      {/* MAIN CONTENT */}
      <div className="flex-1">
        {/* HERO + SIDEBAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* HERO */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <SkeletonLoader type="home-hero" count={2} />
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4">
              <SkeletonLoader type="header-side" />
              <SkeletonLoader type="trending" count={5} />
            </div>
          </div>
        </div>

        {/* SEASONAL */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-16">
          <section>
            <SkeletonLoader type="header-section" />
            <SkeletonLoader type="seasonal" count={12} />
          </section>

          {/* POPULAR */}
          <section>
            <SkeletonLoader type="header-section" />
            <SkeletonLoader type="popular" count={12} />
          </section>
        </div>
      </div>

      {/* ✅ FOOTER SKELETON */}
      <SkeletonLoader type="footer" />
    </main>
  )
}
