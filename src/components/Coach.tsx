'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, Circle, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { won } from '@/lib/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

interface Sched {
  date: string;
  dday: string;
  text: string;
}
interface Coaching {
  date: string;
  weekday: string;
  daily_limit: number;
  total_asset: number;
  schedule: Sched[];
  today_action: string;
  week_plan: string[];
  one_line: string;
}

export default function Coach() {
  const [c, setC] = useState<Coaching | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('app_data')
        .select('value')
        .eq('key', 'coaching')
        .maybeSingle();
      const v = (data?.value as Coaching) ?? null;
      setC(v);
      setLoading(false);
      if (v) {
        try {
          const raw = localStorage.getItem('week_' + v.date);
          if (raw) setDone(JSON.parse(raw));
        } catch {
          // 무시
        }
      }
    })();
  }, []);

  function toggle(i: number) {
    if (!c) return;
    const next = { ...done, [i]: !done[i] };
    setDone(next);
    try {
      localStorage.setItem('week_' + c.date, JSON.stringify(next));
    } catch {
      // 무시
    }
  }

  if (loading)
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        오늘의 코칭 불러오는 중…
      </p>
    );

  if (!c)
    return (
      <Card className="rounded-2xl border border-border/60 bg-card">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          아직 오늘의 코칭이 없어요. PC에서 갱신하면 생겨요.
        </CardContent>
      </Card>
    );

  return (
    <div className="flex flex-col gap-4">
      {/* 오늘 쓸 수 있는 돈 */}
      <Card className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet size={16} className="text-primary" />
            오늘 쓸 수 있는 돈 · {c.date} ({c.weekday})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="text-4xl font-bold tabular-nums text-primary">
            {won(c.daily_limit)}
          </div>
          {c.today_action && (
            <p className="text-[15px] leading-relaxed text-foreground">
              {c.today_action}
            </p>
          )}
          <div className="text-xs text-muted-foreground">
            전재산 약 {won(c.total_asset)} · 적자는 주식 팔아 메우는 중
          </div>
        </CardContent>
      </Card>

      {/* 다가오는 일정 */}
      <Card className="rounded-2xl border border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock size={17} className="text-primary" />
            다가오는 일정
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {c.schedule.map((s, i) => {
            const urgent = s.dday === '오늘' || s.dday === '내일' || s.text.includes('보증금');
            return (
              <div
                key={i}
                className={
                  'flex items-start gap-3 rounded-xl border p-3 ' +
                  (urgent
                    ? 'border-rose-500/40 bg-rose-500/10'
                    : 'border-border/50 bg-muted/30')
                }
              >
                <div className="flex shrink-0 flex-col items-center">
                  <span className="text-sm font-bold">{s.date}</span>
                  <span
                    className={
                      'text-[11px] ' +
                      (urgent
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-muted-foreground')
                    }
                  >
                    {s.dday}
                  </span>
                </div>
                <span className="text-sm leading-snug">{s.text}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 이번 주 할 일 (체크) */}
      <Card className="rounded-2xl border border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base">이번 주 이렇게</CardTitle>
          <CardDescription>
            {c.week_plan.filter((_, i) => done[i]).length}/{c.week_plan.length} 완료
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {c.week_plan.map((p, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-muted/30 p-3 text-left transition-colors hover:bg-muted/60"
            >
              {done[i] ? (
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                />
              ) : (
                <Circle size={20} className="mt-0.5 shrink-0 text-muted-foreground" />
              )}
              <span
                className={
                  done[i]
                    ? 'text-sm text-muted-foreground line-through'
                    : 'text-sm text-foreground'
                }
              >
                {p}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      {c.one_line && (
        <div className="rounded-xl bg-muted/40 px-4 py-3 text-center text-sm font-medium">
          {c.one_line}
        </div>
      )}
    </div>
  );
}
