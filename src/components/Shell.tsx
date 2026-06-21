'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Activity,
  Calculator,
  SlidersHorizontal,
  Sparkles,
  MoreHorizontal,
  Sun,
  Moon,
  LogOut,
  X,
} from 'lucide-react';
import type { Stats, PlannerState } from '@/lib/types';
import { relativeTime } from '@/lib/types';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import Report from '@/components/Report';
import Planner from '@/components/Planner';
import Review from '@/components/Review';
import Coach from '@/components/Coach';

// 섹션 키 — Report 내부 분기 + planner + review + coach
export type SectionKey =
  | 'summary'
  | 'coach'
  | 'spend'
  | 'asset'
  | 'habit'
  | 'planner'
  | 'review';
type ReportSection = 'summary' | 'spend' | 'asset' | 'habit';

// 하단 탭바 5개(핵심). 코치를 가운데 강조.
const TABS: { key: SectionKey; label: string; icon: LucideIcon }[] = [
  { key: 'summary', label: '요약', icon: LayoutDashboard },
  { key: 'spend', label: '소비', icon: ShoppingBag },
  { key: 'coach', label: '코치', icon: Sparkles },
  { key: 'planner', label: '플래너', icon: Calculator },
];

// 더보기 시트에 들어가는 섹션 3종.
const MORE: { key: SectionKey; label: string; icon: LucideIcon }[] = [
  { key: 'asset', label: '자산', icon: Wallet },
  { key: 'habit', label: '습관', icon: Activity },
  { key: 'review', label: '수정', icon: SlidersHorizontal },
];

export default function Shell({
  stats,
  planner,
}: {
  stats: Stats;
  planner: PlannerState;
}) {
  const [section, setSection] = useState<SectionKey>('summary');
  const [moreOpen, setMoreOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  // 섹션 전환 시 본문 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);

  function go(key: SectionKey) {
    setSection(key);
    setMoreOpen(false);
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.style.colorScheme = next ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // 무시
    }
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.replace('/login');
  }

  // 더보기 섹션이 활성이면 더보기 탭도 활성 표시
  const moreActive = MORE.some((m) => m.key === section);
  const fresh = relativeTime(stats.generated_at);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <Toaster richColors position="top-center" theme={dark ? 'dark' : 'light'} />

      {/* 얇은 글라스 헤더 */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4 md:max-w-4xl xl:max-w-6xl">
          <span className="text-base font-semibold tracking-tight">나의 가계부</span>
          {fresh && (
            <span className="text-xs text-muted-foreground">갱신 {fresh}</span>
          )}
        </div>
      </header>

      {/* 본문 — 하단 탭바에 안 가리게 pb-24 */}
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-5 md:max-w-4xl xl:max-w-6xl">
        {section === 'planner' ? (
          <Planner stats={stats} initial={planner} />
        ) : section === 'review' ? (
          <Review stats={stats} />
        ) : section === 'coach' ? (
          <Coach />
        ) : (
          <Report stats={stats} section={section as ReportSection} />
        )}
      </main>

      {/* 더보기 시트(슬라이드업) */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border/60 bg-card p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">더보기</span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="닫기"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
              >
                <Icon icon={X} size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MORE.map(({ key, label, icon }) => {
                const active = section === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => go(key)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-2xl border border-border/50 p-4 text-sm font-medium transition-colors active:scale-[0.97]',
                      active
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted/30 text-foreground hover:bg-muted/60',
                    )}
                  >
                    <Icon icon={icon} size={24} />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/50 bg-muted/30 p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 active:scale-[0.97]"
              >
                <Icon icon={dark ? Sun : Moon} size={20} />
                {dark ? '라이트 모드' : '다크 모드'}
              </button>
              <button
                type="button"
                onClick={signOut}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/50 bg-muted/30 p-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 active:scale-[0.97]"
              >
                <Icon icon={LogOut} size={20} />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 고정 탭바 */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/50 bg-background/80 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-2xl items-stretch md:max-w-4xl xl:max-w-6xl">
          {TABS.map(({ key, label, icon }) => {
            const active = section === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => go(key)}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors active:scale-95',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon icon={icon} size={24} />
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors active:scale-95',
              moreActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon icon={MoreHorizontal} size={24} />
            더보기
          </button>
        </div>
      </nav>
    </div>
  );
}
