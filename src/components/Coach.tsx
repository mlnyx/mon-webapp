'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Target, CheckCircle2, Circle, Quote } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

interface Coaching {
  date: string;
  weekday: string;
  today_comment: string;
  month_plan: string[];
  missions: string[];
  one_number: string;
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
      // 미션 체크 상태(오늘 날짜 기준, localStorage)
      if (v) {
        try {
          const raw = localStorage.getItem('missions_' + v.date);
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
      localStorage.setItem('missions_' + c.date, JSON.stringify(next));
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
          아직 오늘의 코칭이 없어요.
          <br />
          PC에서 갱신(감시기/업데이트)하면 매일 코치가 한마디 남겨요.
        </CardContent>
      </Card>
    );

  const doneCount = c.missions.filter((_, i) => done[i]).length;

  return (
    <div className="flex flex-col gap-4">
      {/* 오늘의 한마디 */}
      <Card className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles size={18} className="text-primary" />
            오늘의 코치 · {c.date} ({c.weekday})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-[15px] leading-relaxed text-foreground">
            {c.today_comment}
          </p>
          {c.one_number && (
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm">
              <Quote size={14} className="shrink-0 text-muted-foreground" />
              <span className="font-medium">{c.one_number}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 오늘의 미션 (과제) */}
      <Card className="rounded-2xl border border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base">🎯 오늘의 미션</CardTitle>
          <CardDescription>
            {doneCount}/{c.missions.length} 완료
            {doneCount === c.missions.length && c.missions.length > 0
              ? ' — 오늘 완벽! 👏'
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {c.missions.map((m, i) => (
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
                {m}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* 이번 달 가이드 */}
      <Card className="rounded-2xl border border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target size={17} className="text-primary" />
            이번 달 이렇게 살자
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {c.month_plan.map((p, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-xl bg-muted/30 p-3 text-sm"
            >
              <span className="mt-0.5 font-bold text-primary">{i + 1}</span>
              <span>{p}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="px-1 text-center text-xs text-muted-foreground">
        코치는 하루 한 번 새로워져요. (PC 갱신 시)
      </p>
    </div>
  );
}
