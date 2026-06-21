'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { Stats } from '@/lib/types';
import { won, LABEL_CHOICES } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

// 애매한 거래를 사용자가 분류 → Supabase labels 에 저장(학습).
// 다음 업데이트(업데이트.bat) 때 파이프라인이 내려받아 영구 반영.
export default function Review({ stats }: { stats: Stats }) {
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // 기존에 저장한 라벨 불러오기
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('app_data')
        .select('value')
        .eq('key', 'labels')
        .maybeSingle();
      if (data?.value) setLabels(data.value as Record<string, string>);
      setLoaded(true);
    })();
  }, []);

  async function setLabel(key: string, category: string) {
    const next = { ...labels };
    if (category) next[key] = category;
    else delete next[key];
    setLabels(next);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('app_data')
      .upsert({ user_id: user.id, key: 'labels', value: next });
    setSavedKey(key);
    setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 1500);
  }

  const review = stats.review ?? [];
  const done = review.filter((r) => labels[r.key]).length;

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl border border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base">애매한 거래 수정</CardTitle>
          <CardDescription>
            분류를 골라주면 저장돼요. 같은 가게는 다음부터 자동 분류돼요(학습).
            {review.length > 0 && (
              <>
                {' '}
                · {done}/{review.length} 완료
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {!loaded && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              불러오는 중…
            </p>
          )}
          {loaded && review.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              수정할 거래가 없어요. 전부 분류됐어요 ✨
            </p>
          )}
          {loaded &&
            review.map((r) => {
              const value = labels[r.key] ?? r.current;
              const corrected = !!labels[r.key];
              return (
                <div
                  key={r.key}
                  className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {r.key}
                      </span>
                      {corrected && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <Check size={11} /> 수정됨
                        </span>
                      )}
                      {savedKey === r.key && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          저장됨
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {won(r.amount)} · {r.count}건 · {r.reason}
                    </div>
                  </div>
                  <select
                    value={value}
                    onChange={(e) => setLabel(r.key, e.target.value)}
                    className="shrink-0 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                  >
                    {/* 현재값이 선택지에 없으면 먼저 보여줌 */}
                    {!LABEL_CHOICES.includes(value) && (
                      <option value={value}>{value}</option>
                    )}
                    {LABEL_CHOICES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
        </CardContent>
      </Card>

      {review.length > 0 && (
        <p className="px-1 text-center text-xs text-muted-foreground">
          저장한 분류는 다음 업데이트 때 통계에 반영돼요.
        </p>
      )}
    </div>
  );
}
