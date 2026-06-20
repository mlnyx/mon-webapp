'use client';

import { useMemo, useState } from 'react';
import type { Stats, PlannerState, PlanIncome } from '@/lib/types';
import { won, comma } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

// 용도 옵션
const TO_OPTS = ['비상금', '투자', '생활비+투자', '생활비'];

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

  // 공통 입력 클래스
  const inputCls =
    'bg-[var(--panel2)] border border-[var(--line)] rounded-md px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]';

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
      {/* 헤더 */}
      <section className="panel">
        <h1 className="text-2xl font-bold">🧮 플래너</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          수입(여러 개·날짜별)과 생활비 한도를 넣으면, 매달 비상금·투자가 얼마씩 쌓이고 목표까지
          언제 닿는지 실시간으로 계산됩니다.
        </p>
      </section>

      {/* ① 수입 다건 */}
      <section className="panel">
        <h2 className="text-lg font-semibold">① 수입 (여러 개 추가 가능)</h2>
        <p className="mb-3 mt-1 text-sm text-[var(--muted)]">
          월급·TA장학처럼 날짜가 다른 수입을 따로 넣으세요. 용도에서 비상금/투자로 보낼지,{' '}
          <b>생활비+투자</b>(생활비 쓰고 남는 건 투자)로 굴릴지 고르면 됩니다.
        </p>

        <div className="flex flex-col gap-2">
          {state.incomes.map((inc, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={inc.name}
                placeholder="이름"
                onChange={(e) => updateIncome(idx, { name: e.target.value })}
                className={`${inputCls} min-w-0 flex-1`}
              />
              <input
                type="text"
                inputMode="numeric"
                value={comma(inc.amount)}
                onChange={(e) => updateIncome(idx, { amount: parseNum(e.target.value) })}
                className={`${inputCls} w-28 text-right tabular-nums`}
              />
              <input
                type="text"
                inputMode="numeric"
                value={inc.day}
                placeholder="일"
                onChange={(e) => updateIncome(idx, { day: parseNum(e.target.value) })}
                className={`${inputCls} w-16 text-center`}
              />
              <select
                value={inc.to}
                onChange={(e) => updateIncome(idx, { to: e.target.value })}
                className={`${inputCls} cursor-pointer`}
              >
                {TO_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeIncome(idx)}
                aria-label="삭제"
                className="rounded-md border border-[var(--line)] bg-[var(--panel2)] px-3 py-2 text-[var(--muted)] hover:text-[var(--warn)]"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addIncome}
          className="mt-3 rounded-md border border-[var(--line)] bg-[var(--panel2)] px-3 py-2 text-sm hover:border-[var(--accent)]"
        >
          + 수입 추가
        </button>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3">
          <span className="text-sm text-[var(--muted)]">월 수입 합계</span>
          <b className="tabular-nums">{won(calc.total)}</b>
        </div>
      </section>

      {/* ② 생활비 한도 */}
      <section className="panel">
        <h2 className="text-lg font-semibold">② 생활비 한도</h2>
        <p className="mb-4 mt-1 text-sm text-[var(--muted)]">
          이 한도 안에서만 쓰면 나머지는 자동으로 투자로 갑니다. 낮출수록 투자가 늘어요.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="w-20 text-sm text-[var(--muted)]">생활비(월)</label>
          <input
            type="range"
            min={800000}
            max={3300000}
            step={10000}
            value={Math.min(state.monthly_budget, 3300000)}
            onChange={(e) => patch({ monthly_budget: parseNum(e.target.value) })}
            className="flex-1 cursor-pointer accent-[var(--accent)]"
          />
          <input
            type="text"
            inputMode="numeric"
            value={comma(state.monthly_budget)}
            onChange={(e) => patch({ monthly_budget: parseNum(e.target.value) })}
            className={`${inputCls} w-32 text-right tabular-nums`}
          />
          <span className="text-sm text-[var(--muted)]">원</span>
        </div>

        <div className="mt-2 text-sm text-[var(--muted)]">
          주 약 <b>{comma(weekly)}원</b> · 현재 평균 {comma(Math.round(avgSpend))}원{' '}
          {saveDiff > 0 && (
            <span className="text-[var(--accent2)]">↓ {comma(saveDiff)} 절약</span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="w-20 text-sm text-[var(--muted)]">고정비(월)</label>
          <input
            type="text"
            inputMode="numeric"
            value={comma(state.fixed_cost)}
            onChange={(e) => patch({ fixed_cost: parseNum(e.target.value) })}
            className={`${inputCls} w-32 text-right tabular-nums`}
          />
          <span className="text-sm text-[var(--muted)]">원 (구독·통신)</span>
        </div>
      </section>

      {/* ③ 자동 배분 */}
      <section className="panel">
        <h2 className="text-lg font-semibold">③ 이번 달 자동 배분</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--line)] bg-[var(--panel2)] p-4">
            <div className="text-sm text-[var(--muted)]">🛟 비상금 적립</div>
            <div className="mt-1 text-xl font-bold tabular-nums">{won(calc.emgAdd)}</div>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-[var(--panel2)] p-4">
            <div className="text-sm text-[var(--muted)]">💎 투자 적립</div>
            <div className="mt-1 text-xl font-bold tabular-nums">{won(calc.invAdd)}</div>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-[var(--panel2)] p-4">
            <div className="text-sm text-[var(--muted)]">🛒 생활비 (+고정비)</div>
            <div className="mt-1 text-xl font-bold tabular-nums">{won(calc.spend)}</div>
          </div>
          <div
            className={`rounded-lg border bg-[var(--panel2)] p-4 ${
              calc.shortfall > 0 ? 'border-[var(--warn)]' : 'border-[var(--accent2)]'
            }`}
          >
            <div className="text-sm text-[var(--muted)]">여윗돈 / 수지</div>
            <div
              className={`mt-1 text-xl font-bold tabular-nums ${
                calc.shortfall > 0 ? 'text-[var(--warn)]' : 'text-[var(--accent2)]'
              }`}
            >
              {calc.shortfall > 0 ? `−${comma(calc.shortfall)}원` : `+${comma(calc.coverage)}원`}
            </div>
            <div className="mt-1 text-xs text-[var(--muted)]">
              {calc.shortfall > 0
                ? '생활비가 수입보다 큼 — 비상금/주식을 헐어야 함 ⚠️'
                : `생활비 쓰고 남는 ${won(calc.coverage)}이 투자로 갑니다 ✅`}
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 목표 트래커 */}
      <section className="panel">
        <h2 className="text-lg font-semibold">🎯 목표 트래커</h2>
        <div className="mb-4 mt-1 text-sm text-[var(--muted)]">
          목표월(<b>{state.target_month}</b>)까지 <b>{months}개월</b> 남음 · 이 속도로 가면:
        </div>

        {/* 비상금 */}
        <GoalBlock
          label="🛟 비상금"
          cur={state.current_emergency}
          goal={state.goal_emergency}
          proj={emg.proj}
          pctProj={emg.pctProj}
          hit={emg.hit}
          mToGoal={emg.mToGoal}
          add={calc.emgAdd}
        />

        <div className="mt-5">
          <GoalBlock
            label="💎 투자"
            cur={state.current_invest}
            goal={state.goal_invest}
            proj={inv.proj}
            pctProj={inv.pctProj}
            hit={inv.hit}
            mToGoal={inv.mToGoal}
            add={calc.invAdd}
          />
        </div>

        {/* 저장 / 초기화 */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-[var(--bg)] disabled:opacity-60"
          >
            {saving ? '저장 중…' : '💾 저장'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-[var(--line)] bg-[var(--panel2)] px-4 py-2"
          >
            기본값으로 초기화
          </button>
          {saved && <span className="text-sm text-[var(--accent2)]">✓ 저장됨</span>}
        </div>
      </section>
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
  const col = hit ? 'var(--accent2)' : 'var(--accent)';
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span>
          {label}{' '}
          <span className="text-xs text-[var(--muted)]">(목표 {won(goal)})</span>
        </span>
        <span className="text-sm tabular-nums">
          {won(cur)} → 예상 <b style={{ color: col }}>{won(proj)}</b>
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--panel2)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${pctProj}%`, background: col }}
        />
      </div>
      <div className="mt-1.5 text-xs text-[var(--muted)]">
        {hit
          ? `✅ 목표 달성 (+${won(proj - goal)} 여유)`
          : add > 0
            ? `이 속도면 ${mToGoal}개월 뒤 달성 · 월 ${won(add)}씩 · 목표월엔 ${won(goal - proj)} 부족`
            : '적립액이 0이라 목표에 못 닿아요'}
      </div>
    </div>
  );
}
