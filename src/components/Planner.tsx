'use client';

import { useMemo, useState } from 'react';
import { Plus, X, PiggyBank, Gem, ShoppingCart, Target } from 'lucide-react';
import type { Stats, PlannerState, PlanIncome } from '@/lib/types';
import { won, comma } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

// 용도 옵션
const TO_OPTS = ['비상금', '투자', '생활비+투자', '생활비'];
const CARD = 'rounded-2xl border border-border/60 bg-card shadow-sm';
const INPUT =
  'rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary';

// 목표월까지 남은 개월 수
function monthsToTarget(targetMonth: string): number {
  const [ty, tmo] = (targetMonth || '2026-10').split('-').map(Number);
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  return Math.max(0, (ty - cy) * 12 + (tmo - cm));
}

// 콤마 입력 → 숫자
function parseNum(v: string): number {
  const n = parseInt(v.replace(/[^0-9-]/g, ''), 10);
  return Number.isNaN(n) ? 0 : n;
}

export default function Planner({ stats, initial }: { stats: Stats; initial: PlannerState }) {
  const [state, setState] = useState<PlannerState>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const avgSpend = stats.typical?.spend ?? 3280209;

  // 상태 일부만 갱신하는 헬퍼
  const patch = (p: Partial<PlannerState>) => setState((s) => ({ ...s, ...p }));

  // ---- 수입 줄 편집 ----
  const updateIncome = (idx: number, p: Partial<PlanIncome>) =>
    setState((s) => ({
      ...s,
      incomes: s.incomes.map((inc, i) => (i === idx ? { ...inc, ...p } : inc)),
    }));

  const addIncome = () =>
    setState((s) => ({
      ...s,
      incomes: [...s.incomes, { name: '용돈', amount: 0, day: 1, to: '생활비' }],
    }));

  const removeIncome = (idx: number) =>
    setState((s) => ({ ...s, incomes: s.incomes.filter((_, i) => i !== idx) }));

  // ---- 실시간 자동 배분 계산 ----
  const calc = useMemo(() => {
    const inc = state.incomes;
    const total = inc.reduce((sm, x) => sm + (x.amount || 0), 0);
    const emgIn = inc.filter((x) => x.to === '비상금').reduce((sm, x) => sm + x.amount, 0);
    const invDirect = inc.filter((x) => x.to === '투자').reduce((sm, x) => sm + x.amount, 0);
    const livingPool = inc
      .filter((x) => x.to === '생활비' || x.to === '생활비+투자')
      .reduce((sm, x) => sm + x.amount, 0);
    const spend = state.monthly_budget + state.fixed_cost; // 생활비+고정비
    const coverage = livingPool - spend; // 생활비 풀에서 쓰고 남는 돈
    const invFromSalary = Math.max(0, coverage); // 남으면 투자로
    const invAdd = invDirect + invFromSalary;
    const emgAdd = emgIn;
    const shortfall = Math.max(0, -coverage);
    return { total, spend, coverage, invAdd, emgAdd, shortfall };
  }, [state.incomes, state.monthly_budget, state.fixed_cost]);

  // 주 생활비
  const weekly = Math.round(state.monthly_budget / 4.345);
  // 평균 대비 절약액
  const saveDiff = Math.round(avgSpend) - state.monthly_budget;

  const months = monthsToTarget(state.target_month);

  // 목표 진행 막대 데이터
  const goalBar = (cur: number, add: number, goal: number) => {
    const proj = cur + add * months;
    const pctCur = Math.min(100, (cur / goal) * 100);
    const pctProj = Math.min(100, (proj / goal) * 100);
    const hit = proj >= goal;
    const mToGoal = add > 0 ? Math.ceil((goal - cur) / add) : Infinity;
    return { proj, pctCur, pctProj, hit, mToGoal };
  };
  const emg = goalBar(state.current_emergency, calc.emgAdd, state.goal_emergency);
  const inv = goalBar(state.current_invest, calc.invAdd, state.goal_invest);

  // ---- 저장 ----
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSaving(false);
        return; // 로그인 안 됨 — 저장 스킵
      }
      await supabase.from('app_data').upsert({ user_id: user.id, key: 'planner', value: state });
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    } finally {
      setSaving(false);
    }
  };

  // ---- 기본값 초기화 ----
  const handleReset = () => setState(initial);

  return (
    <div className="flex flex-col gap-4 reveal">
      {/* 헤더 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon icon={Target} size={20} className="text-primary" />
            플래너
          </CardTitle>
          <CardDescription>
            수입과 생활비 한도를 넣으면 비상금·투자가 얼마씩 쌓이고 목표까지 언제 닿는지
            실시간으로 계산돼요.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* ① 수입 다건 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="text-base">① 수입</CardTitle>
          <CardDescription>
            날짜가 다른 수입을 따로 넣고, 용도(비상금/투자/생활비+투자)를 고르세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {state.incomes.map((inc, idx) => (
            <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
              <input
                type="text"
                value={inc.name}
                placeholder="이름"
                onChange={(e) => updateIncome(idx, { name: e.target.value })}
                className={cn(INPUT, 'w-full min-w-0 sm:w-auto sm:flex-1')}
              />
              <input
                type="text"
                inputMode="numeric"
                value={comma(inc.amount)}
                onChange={(e) => updateIncome(idx, { amount: parseNum(e.target.value) })}
                className={cn(INPUT, 'w-28 text-right tabular-nums')}
              />
              <input
                type="text"
                inputMode="numeric"
                value={inc.day}
                placeholder="일"
                onChange={(e) => updateIncome(idx, { day: parseNum(e.target.value) })}
                className={cn(INPUT, 'w-14 text-center')}
              />
              <select
                value={inc.to}
                onChange={(e) => updateIncome(idx, { to: e.target.value })}
                className={cn(INPUT, 'cursor-pointer')}
              >
                {TO_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeIncome(idx)}
                aria-label="삭제"
                className="text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
              >
                <Icon icon={X} size={16} />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIncome}
            className="mt-1 self-start"
          >
            <Icon icon={Plus} size={16} />
            수입 추가
          </Button>

          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-3 text-sm">
            <span className="text-muted-foreground">월 수입 합계</span>
            <b className="tabular-nums">{won(calc.total)}</b>
          </div>
        </CardContent>
      </Card>

      {/* ② 생활비 한도 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="text-base">② 생활비 한도</CardTitle>
          <CardDescription>
            이 한도 안에서만 쓰면 나머지는 자동으로 투자로 가요. 낮출수록 투자가 늘어요.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="w-16 text-sm text-muted-foreground">생활비(월)</label>
            <input
              type="range"
              min={800000}
              max={3300000}
              step={10000}
              value={Math.min(state.monthly_budget, 3300000)}
              onChange={(e) => patch({ monthly_budget: parseNum(e.target.value) })}
              className="flex-1 cursor-pointer accent-primary"
            />
            <input
              type="text"
              inputMode="numeric"
              value={comma(state.monthly_budget)}
              onChange={(e) => patch({ monthly_budget: parseNum(e.target.value) })}
              className={cn(INPUT, 'w-32 text-right tabular-nums')}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            주 약 <b className="text-foreground">{comma(weekly)}원</b> · 현재 평균{' '}
            {comma(Math.round(avgSpend))}원{' '}
            {saveDiff > 0 && <span className="text-emerald-600 dark:text-emerald-400">↓ {comma(saveDiff)} 절약</span>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="w-16 text-sm text-muted-foreground">고정비(월)</label>
            <input
              type="text"
              inputMode="numeric"
              value={comma(state.fixed_cost)}
              onChange={(e) => patch({ fixed_cost: parseNum(e.target.value) })}
              className={cn(INPUT, 'w-32 text-right tabular-nums')}
            />
            <span className="text-sm text-muted-foreground">원 (구독·통신)</span>
          </div>
        </CardContent>
      </Card>

      {/* ③ 자동 배분 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="text-base">③ 이번 달 자동 배분</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AllocCell icon={PiggyBank} label="비상금 적립" value={won(calc.emgAdd)} />
          <AllocCell icon={Gem} label="투자 적립" value={won(calc.invAdd)} />
          <AllocCell icon={ShoppingCart} label="생활비 (+고정비)" value={won(calc.spend)} />
          <div
            className={cn(
              'rounded-xl border p-4',
              calc.shortfall > 0
                ? 'border-rose-500/40 bg-rose-500/10'
                : 'border-emerald-500/40 bg-emerald-500/10',
            )}
          >
            <div className="text-xs text-muted-foreground">여윗돈 / 수지</div>
            <div
              className={cn(
                'mt-1 text-xl font-bold tabular-nums',
                calc.shortfall > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400',
              )}
            >
              {calc.shortfall > 0 ? `−${comma(calc.shortfall)}원` : `+${comma(calc.coverage)}원`}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {calc.shortfall > 0
                ? '생활비가 수입보다 큼 — 비상금/주식을 헐어야 함'
                : `생활비 쓰고 남는 ${won(calc.coverage)}이 투자로 가요`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🎯 목표 트래커 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon icon={Target} size={20} className="text-primary" />
            목표 트래커
          </CardTitle>
          <CardDescription>
            목표월(<b>{state.target_month}</b>)까지 <b>{months}개월</b> 남음 · 이 속도로 가면
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-4">
            <GoalBlock
              label="비상금"
              cur={state.current_emergency}
              goal={state.goal_emergency}
              proj={emg.proj}
              pctProj={emg.pctProj}
              hit={emg.hit}
              mToGoal={emg.mToGoal}
              add={calc.emgAdd}
            />
            <GoalBlock
              label="투자"
              cur={state.current_invest}
              goal={state.goal_invest}
              proj={inv.proj}
              pctProj={inv.pctProj}
              hit={inv.hit}
              mToGoal={inv.mToGoal}
              add={calc.invAdd}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              기본값으로 초기화
            </Button>
            {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">✓ 저장됨</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 자동 배분 셀
function AllocCell({
  icon,
  label,
  value,
}: {
  icon: typeof PiggyBank;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon icon={icon} size={16} />
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

// 목표 진행 막대 블록
function GoalBlock({
  label,
  cur,
  goal,
  proj,
  pctProj,
  hit,
  mToGoal,
  add,
}: {
  label: string;
  cur: number;
  goal: number;
  proj: number;
  pctProj: number;
  hit: boolean;
  mToGoal: number;
  add: number;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium">
          {label} <span className="text-xs text-muted-foreground">(목표 {won(goal)})</span>
        </span>
        <span className="text-sm tabular-nums">
          {won(cur)} → 예상{' '}
          <b className={hit ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}>{won(proj)}</b>
        </span>
      </div>
      <div className="mt-2">
        <Progress value={pctProj} className={hit ? '[&>div]:bg-emerald-400' : undefined} />
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground">
        {hit
          ? `목표 달성 (+${won(proj - goal)} 여유)`
          : add > 0
            ? `이 속도면 ${mToGoal}개월 뒤 달성 · 월 ${won(add)}씩 · 목표월엔 ${won(goal - proj)} 부족`
            : '적립액이 0이라 목표에 못 닿아요'}
      </div>
    </div>
  );
}
