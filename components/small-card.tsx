"use client"

import Image from "next/image"

interface SmallCardProps {
  image: string
  title: string
  description?: string
}

export function SmallCard({ image, title, description }: SmallCardProps) {
  return (
    <div className="w-[150px] flex flex-col cursor-pointer hover:opacity-90 transition">
      
      {/* Poster */}
      <div className="w-full h-[200px] bg-muted rounded-lg overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={200}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <p className="mt-2 text-sm font-semibold text-foreground line-clamp-1">
        {title}
      </p>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}
    </div>
  )
}
