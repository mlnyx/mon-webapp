'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, RefreshCw, Camera } from 'lucide-react';
import { toast } from 'sonner';
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
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton-card';

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

  // 처리 대기 중인 캡처 수 (PC가 처리하면 행이 사라짐)
  const [pending, setPending] = useState<number | null>(null);
  const wasPending = useRef(false);

  // 대기 중인 capture:% 행 수를 세서 상태 갱신. 0이 되면 토스트 1회.
  async function pollPending() {
    const supabase = createClient();
    const { count } = await supabase
      .from('app_data')
      .select('key', { count: 'exact', head: true })
      .like('key', 'capture:%');
    const n = count ?? 0;
    setPending(n);
    if (n > 0) {
      wasPending.current = true;
    } else if (wasPending.current) {
      wasPending.current = false;
      toast.success('반영됐어요! 새로고침하면 보여요', { icon: '✓' });
    }
    return n;
  }

  // 마운트 시 1회 확인
  useEffect(() => {
    pollPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 업로드 직후 몇 번(10초 간격) 폴링해 처리 완료를 잡는다.
  function startPolling(times = 6) {
    let left = times;
    const id = setInterval(async () => {
      const n = await pollPending();
      left -= 1;
      if (n === 0 || left <= 0) clearInterval(id);
    }, 10000);
  }

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

  const [refreshing, setRefreshing] = useState(false);
  async function requestRefresh() {
    setRefreshing(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('app_data').upsert({
        user_id: user.id,
        key: 'refresh',
        value: { requested_at: new Date().toISOString() },
      });
      toast.success('갱신을 요청했어요 · PC가 켜져 있으면 곧 반영돼요');
    }
    setTimeout(() => setRefreshing(false), 2500);
  }

  // ── 캡처 업로드 ──
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<string[]>([]);
  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    for (const f of files) {
      const dataUrl: string = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(f);
      });
      await supabase.from('app_data').insert({
        user_id: user.id,
        key: 'capture:' + crypto.randomUUID(),
        value: { image: dataUrl, name: f.name, at: new Date().toISOString() },
      });
      setUploads((u) => [...u, f.name]);
    }
    if (fileRef.current) fileRef.current.value = '';
    toast.success(`${files.length}장 올렸어요 · PC가 처리하면 반영돼요`, {
      icon: '📷',
    });
    pollPending();
    startPolling();
  }

  const review = stats.review ?? [];
  const done = review.filter((r) => labels[r.key]).length;

  return (
    <div className="flex flex-col gap-4">
      {/* 캡처 업로드 */}
      <Card className="rounded-2xl border border-border/60 bg-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">📷 캡처 올리기</p>
              <p className="text-xs text-muted-foreground">
                은행·카드 거래내역 캡처를 올리면 자동으로 읽어 정리해요
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onPick}
              className="hidden"
            />
            <Button onClick={() => fileRef.current?.click()} className="shrink-0">
              <Camera size={15} />
              올리기
            </Button>
          </div>
          {pending !== null && pending > 0 ? (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
              ⏳ 처리 대기 {pending}장 — PC가 켜져 있으면 곧 읽어서 반영돼요
            </p>
          ) : (
            uploads.length > 0 && (
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                ✓ {uploads.length}장 올렸어요 — 처리되면 자동으로 반영돼요
              </p>
            )
          )}
        </CardContent>
      </Card>

      {/* 지금 갱신 */}
      <Card className="rounded-2xl border border-border/60 bg-card">
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">지금 갱신</p>
            <p className="text-xs text-muted-foreground">
              수정한 분류·새 거래를 반영해요 (PC가 켜져 있을 때)
            </p>
          </div>
          <Button onClick={requestRefresh} disabled={refreshing} className="shrink-0">
            <RefreshCw
              size={15}
              className={refreshing ? 'animate-spin' : ''}
            />
            {refreshing ? '요청됨' : '갱신'}
          </Button>
        </CardContent>
      </Card>

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
          {!loaded && <SkeletonList count={2} />}
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
