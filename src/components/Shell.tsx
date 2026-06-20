'use client';

import { useState } from 'react';
import type { Stats, PlannerState } from '@/lib/types';
import Report from '@/components/Report';
import Planner from '@/components/Planner';

export default function Shell({
  stats,
  planner,
}: {
  stats: Stats;
  planner: PlannerState;
}) {
  const [tab, setTab] = useState<'report' | 'planner'>('report');

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 -mx-4 px-4 py-3 backdrop-blur bg-[var(--bg)]/80 border-b border-[var(--line)]">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">나의 가계부</h1>
          <form action="/auth/signout" method="post">
            <button className="text-xs text-[var(--muted)] hover:text-[var(--text)]">
              로그아웃
            </button>
          </form>
        </div>
        {/* 탭 */}
        <div className="mt-3 flex gap-1 rounded-xl bg-[var(--panel)] p-1 border border-[var(--line)]">
          {([['report', '📊 리포트'], ['planner', '🧮 플래너']] as const).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  tab === key
                    ? 'bg-[var(--panel2)] text-[var(--text)]'
                    : 'text-[var(--muted)]'
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </header>

      <main className="pt-5">
        {tab === 'report' ? (
          <Report stats={stats} />
        ) : (
          <Planner stats={stats} initial={planner} />
        )}
      </main>
    </div>
  );
}
