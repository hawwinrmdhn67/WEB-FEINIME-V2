import { SkeletonLoader } from '@/components/skeleton-loader'

export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">

      {/* MAIN CONTENT */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SkeletonLoader type="page-header" />
          <SkeletonLoader type="popular" count={12} />
        </div>
      </div>

      {/* FOOTER SKELETON */}
      <SkeletonLoader type="footer" />
    </main>
  )
}
