'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Activity,
  Calculator,
} from 'lucide-react';
import type { Stats, PlannerState } from '@/lib/types';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import Report from '@/components/Report';
import Planner from '@/components/Planner';
import ThemeToggle from '@/components/ThemeToggle';

// 섹션 키 — Report 내부 분기('summary'|'spend'|'asset'|'habit') + 'planner'
export type SectionKey = 'summary' | 'spend' | 'asset' | 'habit' | 'planner';
type ReportSection = Exclude<SectionKey, 'planner'>;

const NAV: { key: SectionKey; label: string; icon: LucideIcon }[] = [
  { key: 'summary', label: '요약', icon: LayoutDashboard },
  { key: 'spend', label: '소비', icon: ShoppingBag },
  { key: 'asset', label: '자산', icon: Wallet },
  { key: 'habit', label: '습관', icon: Activity },
  { key: 'planner', label: '플래너', icon: Calculator },
];

export default function Shell({
  stats,
  planner,
}: {
  stats: Stats;
  planner: PlannerState;
}) {
  const [section, setSection] = useState<SectionKey>('summary');

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* 글라스 TopBar */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto max-w-2xl px-4 md:max-w-4xl xl:max-w-6xl">
          <div className="flex h-14 items-center justify-between">
            <span className="text-base font-semibold tracking-tight">나의 가계부</span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </div>

          {/* 섹션 네비 — 모바일 가로 스크롤 */}
          <nav className="-mx-1 flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV.map(({ key, label, icon }) => {
              const active = section === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSection(key)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon icon={icon} size={16} />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 본문 */}
      <main className="mx-auto max-w-2xl px-4 py-5 md:max-w-4xl xl:max-w-6xl">
        {section === 'planner' ? (
          <Planner stats={stats} initial={planner} />
        ) : (
          <Report stats={stats} section={section as ReportSection} />
        )}
      </main>
    </div>
  );
}
