import { cn } from '@/lib/utils';

// 회색 펄스 박스. 로딩 중 카드 자리표시용.
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-muted', className)} />;
}

// 카드 한 장 모양의 스켈레톤(제목 + 본문 줄 몇 개).
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5',
        className,
      )}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

// 여러 장을 세로로 쌓은 로딩 화면.
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
