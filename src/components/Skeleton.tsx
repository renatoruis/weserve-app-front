"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={`skeleton ${className || ""}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-sm">
      <Skeleton className="w-full h-36" />
      <div className="p-4">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function SermonSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm">
      <div className="flex gap-3">
        <Skeleton className="w-28 h-20 rounded-xl shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function PrayerSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm">
      <div className="flex gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function NoticeSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm">
      <Skeleton className="h-5 w-2/3 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function ListSkeleton({ count = 3, type = "card" }: { count?: number; type?: "card" | "sermon" | "prayer" | "notice" }) {
  const Component = type === "sermon" ? SermonSkeleton
    : type === "prayer" ? PrayerSkeleton
    : type === "notice" ? NoticeSkeleton
    : CardSkeleton;

  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
