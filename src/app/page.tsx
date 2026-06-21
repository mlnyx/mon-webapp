'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fetchStats, fetchPlanner, plannerDefault } from '@/lib/client-data';
import type { Stats, PlannerState } from '@/lib/types';
import Shell from '@/components/Shell';
import { SkeletonList } from '@/components/ui/skeleton-card';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [planner, setPlanner] = useState<PlannerState | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const s = await fetchStats();
      if (!alive) return;
      if (!s) {
        setMsg('아직 데이터가 없어요. PC에서 업데이트(시드)를 한 번 돌려주세요.');
        setLoading(false);
        return;
      }
      const saved = await fetchPlanner();
      if (!alive) return;
      setStats(s);
      setPlanner(saved ?? plannerDefault(s));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  if (loading)
    return (
      <div className="min-h-dvh bg-background">
        <div className="mx-auto max-w-2xl px-4 pt-16 md:max-w-4xl xl:max-w-6xl">
          <SkeletonList count={4} />
        </div>
      </div>
    );

  if (!stats || !planner)
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-center">
        <div className="rounded-2xl border border-border/60 bg-card p-8">
          <h1 className="mb-2 text-lg font-bold">나의 가계부</h1>
          <p className="text-sm text-muted-foreground">{msg}</p>
        </div>
      </div>
    );

  return <Shell stats={stats} planner={planner} />;
}
